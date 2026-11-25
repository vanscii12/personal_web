import { useState } from 'react';
import { LEGEND_PASSES, TRAILS, trailColorCss } from '../shared/tileStyle.js';
import { Crumb } from './Crumb.jsx';
import { big, count, isoMonth } from './format.js';

const LAYER_TOGGLES = [
  ['fog', '迷雾'],
  ['trails', '光轨'],
  ['regions', '行政区'],
  ['terrain', '地形']
];
const LIT_LABELS = ['国家', '省 / 州', '市 / 县'];

// On phone-sized screens the open panel would cover most of the map, so it starts closed.
const startsCollapsed = () => window.matchMedia('(max-width: 760px)').matches;

function Tile({ label, value, unit }) {
  return (
    <div className="tile">
      <dt className="tile__label">{label}</dt>
      <dd className="tile__value">
        {value}
        {unit ? <span className="tile__unit">{unit}</span> : null}
      </dd>
    </div>
  );
}

function YearSelect({ label, value, years, onChange }) {
  return (
    <select className="input mono" aria-label={label} value={value} onChange={(event) => onChange(Number(event.target.value))}>
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
}

export function Hud({
  meta,
  stats,
  lit,
  years,
  yearRange,
  onYearRangeChange,
  radius,
  onRadiusChange,
  layers,
  onLayersChange,
  onView
}) {
  const [collapsed, setCollapsed] = useState(startsCollapsed);
  const [from, to] = yearRange;
  const first = years[0];
  const last = years.at(-1);
  const presets = [
    ['全部', [first, last]],
    ['近 3 年', [Math.max(first, last - 2), last]],
    ['近 1 年', [last, last]]
  ];

  return (
    <aside className="hud rise-in" aria-label="足迹面板">
      <Crumb />
      <div className="hud__titlebar">
        <h1 className="title">
          Footprint<span className="title__dot">.</span>
        </h1>
        <button
          type="button"
          className="hud__collapse"
          aria-expanded={!collapsed}
          aria-label={collapsed ? '展开面板' : '收起面板'}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? '+' : '−'}
        </button>
      </div>
      <p className="subline">
        <span className="mono">
          {isoMonth(meta.timeRange[0])} → {isoMonth(meta.timeRange[1])}
        </span>
        {' · '}
        {count(meta.days)} 天有记录
      </p>

      {collapsed ? null : (
        <>
          <hr className="rule line-in" />
          <dl className="tiles">
            <Tile label="记录天数" value={count(stats?.days)} />
            <Tile label="轨迹里程" value={big(stats?.distanceKm)} unit="km" />
          </dl>
          {lit ? (
            <div className="lit">
              <span className="field__name">点亮</span>
              <dl className="tiles tiles--three">
                {LIT_LABELS.map((label, level) => (
                  <Tile key={label} label={label} value={count(lit[level])} />
                ))}
              </dl>
            </div>
          ) : null}
          <p className="note tiles__note">
            {big(stats?.points)} 个点 · {big(stats?.tracks)} 段轨迹
          </p>

          <div className="controls">
            <div className="field">
              <span className="field__name">年份</span>
              <div className="pills">
                {presets.map(([label, preset]) => (
                  <button
                    key={label}
                    type="button"
                    className={`pill${preset[0] === from && preset[1] === to ? ' is-on' : ''}`}
                    aria-pressed={preset[0] === from && preset[1] === to}
                    onClick={() => onYearRangeChange(preset)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="field__range">
                <YearSelect
                  label="起始年份"
                  value={from}
                  years={years}
                  onChange={(year) => onYearRangeChange([year, Math.max(year, to)])}
                />
                <span className="muted">→</span>
                <YearSelect
                  label="结束年份"
                  value={to}
                  years={years}
                  onChange={(year) => onYearRangeChange([Math.min(from, year), year])}
                />
              </div>
            </div>

            <div className="field">
              <label className="field__name" htmlFor="fog-radius">
                迷雾半径
              </label>
              <div className="field__slider">
                <input
                  id="fog-radius"
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={radius}
                  onChange={(event) => onRadiusChange(Number(event.target.value))}
                />
                <output className="mono" htmlFor="fog-radius">
                  {radius} m
                </output>
              </div>
            </div>

            <div className="field">
              <span className="field__name">图层</span>
              <div className="pills">
                {LAYER_TOGGLES.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`pill${layers[key] ? ' is-on' : ''}`}
                    aria-pressed={layers[key]}
                    onClick={() => onLayersChange({ ...layers, [key]: !layers[key] })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ctas">
              <button type="button" className="cta" onClick={() => onView('home')}>
                常驻地 →
              </button>
              <button type="button" className="cta" onClick={() => onView('overview')}>
                全览 →
              </button>
            </div>
          </div>

          {layers.trails || (lit && layers.regions) ? (
            <div className="legend">
              {layers.trails ? (
                <>
                  <span className="field__name">经过次数</span>
                  <ul className="legend__keys">
                    {LEGEND_PASSES.map((passes) => (
                      <li key={passes}>
                        <i className="key" style={{ background: trailColorCss(passes) }} />
                        <span className="mono">{passes === TRAILS.saturationPasses ? `${passes}+` : passes}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              {lit && layers.regions ? (
                <ul className="legend__keys">
                  <li>
                    <i className="key key--region" />
                    <span>去过的行政区，越亮去得越多</span>
                  </li>
                </ul>
              ) : null}
              <p className="note">悬停地图，查看所在地区和附近去过几天</p>
            </div>
          ) : null}
        </>
      )}
    </aside>
  );
}
