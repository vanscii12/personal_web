// Promise wrappers around a small pool of footprint workers, each with its own copy of the
// points. Tiles go to the least busy worker, everything else to the first one. Aborting a
// call rejects it right away and drops it from the worker's queue if it is still waiting
// (only tiles are queued).
function connect() {
  const worker = new Worker(new URL('../worker/footprint.worker.js', import.meta.url), { type: 'module' });
  const pending = new Map();
  let nextId = 1;

  worker.onmessage = ({ data }) => {
    const entry = pending.get(data.id);
    if (!entry) return;
    pending.delete(data.id);
    if (data.error) entry.reject(new Error(data.error));
    else entry.resolve(data.result);
  };

  worker.onerror = (event) => {
    const error = new Error(event.message || 'Footprint worker failed');
    for (const entry of pending.values()) entry.reject(error);
    pending.clear();
  };

  function call(type, payload, signal) {
    const id = nextId;
    nextId += 1;
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      pending.set(id, { resolve, reject });
      worker.postMessage({ id, type, payload });
      signal?.addEventListener(
        'abort',
        () => {
          if (!pending.delete(id)) return;
          worker.postMessage({ type: 'cancel', payload: { id } });
          reject(new DOMException('Aborted', 'AbortError'));
        },
        { once: true }
      );
    });
  }

  return {
    call,
    get busy() {
      return pending.size;
    },
    terminate() {
      worker.terminate();
      pending.clear();
    }
  };
}

function defaultPoolSize() {
  const cores = navigator.hardwareConcurrency || 4;
  return Math.min(4, Math.max(2, cores - 1));
}

export function createFootprintClient(size = defaultPoolSize()) {
  const workers = Array.from({ length: size }, connect);

  return {
    init(buffer) {
      return Promise.all(workers.map((worker) => worker.call('init', { buffer })));
    },

    call(type, payload, signal) {
      return workers[0].call(type, payload, signal);
    },

    // Prefers the later workers on ties so the first one stays free for queries.
    tile(url, signal) {
      let target = workers[workers.length - 1];
      for (let k = workers.length - 2; k >= 0; k -= 1) {
        if (workers[k].busy < target.busy) target = workers[k];
      }
      return target.call('tile', { url }, signal);
    },

    terminate() {
      for (const worker of workers) worker.terminate();
    }
  };
}
