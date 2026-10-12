from __future__ import annotations

import argparse
import posixpath
import re
from pathlib import Path


SUPPORTED_EXTENSIONS = {".webp", ".jpg", ".jpeg", ".png", ".gif", ".avif"}

CATEGORY_LIST_FILES = {
    "travel": "src/gallery/items/travel.js",
    "film": "src/gallery/items/film.js",
    "daily": "src/gallery/items/daily.js",
}

ITEMS_JS_PATH = "src/gallery/items.js"


def js_string(value: str) -> str:
    """Escape a Python string for safe single-quoted JS output."""
    return (
        value.replace("\\", "\\\\")
        .replace("'", "\\'")
        .replace("\r", "\\r")
        .replace("\n", "\\n")
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Scan an image folder and generate gallery data files."
    )
    parser.add_argument("input", help="Image folder to scan.")
    parser.add_argument("-o", "--output", required=True, help="Output JS file path for the item detail.")
    parser.add_argument("--id", required=True, help="Project ID.")
    parser.add_argument("--title", required=True, help="Project title.")
    parser.add_argument("--date", default="", help="Date or date range text.")
    parser.add_argument("--summary", default="", help="Project summary text.")
    parser.add_argument("--category", choices=["travel", "film", "daily"],
                        required=True, help="Category (travel/film/daily).")
    parser.add_argument(
        "--base-path",
        required=True,
        help="Image path prefix used in the browser, for example /img-webp/travel/dali",
    )
    parser.add_argument(
        "--project-root",
        default=".",
        help="Project root directory (default: current directory).",
    )
    parser.add_argument(
        "--thumb-subdir",
        default="thumbs",
        help="缩略图在 base-path 下的子目录名，与 batch_to_webp 的 thumbs/ 一致；"
        "设为空字符串则不写入 thumbSrc。",
    )
    return parser.parse_args()


def natural_sort_key(value: str) -> list[object]:
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", value)]


def collect_images(input_dir: Path) -> list[str]:
    image_paths = [
        path.name
        for path in input_dir.iterdir()
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    ]
    return sorted(image_paths, key=natural_sort_key)


def _web_join(base_path: str, *segments: str) -> str:
    """Join URL path segments with forward slashes (posix-style)."""
    base = base_path.replace("\\", "/").rstrip("/")
    if base.startswith("."):
        base = base.split(".")[-1].rstrip("/")
    rest = [s.replace("\\", "/").strip("/") for s in segments if s is not None and str(s).strip("/")]
    if not base:
        return posixpath.join(*rest).replace("\\", "/") if rest else ""
    return posixpath.join(base, *rest).replace("\\", "/")


def build_item_output(args: argparse.Namespace, image_names: list[str]) -> str:
    base_path = args.base_path.rstrip("/").replace("\\", "/")
    if base_path.startswith("."):
        base_path = base_path.split(".")[-1]
    thumb_subdir = (args.thumb_subdir or "").strip().strip("/")

    lines: list[str] = []
    for i, name in enumerate(image_names):
        name = name.replace("\\", "/").lstrip("/")
        src = _web_join(base_path, name)
        if thumb_subdir:
            thumb = _web_join(base_path, thumb_subdir, name)
            lines.append(
                f"  {{ src: '{js_string(src)}', thumbSrc: '{js_string(thumb)}', "
                f"alt: '{js_string(Path(name).stem)} {i + 1}' }}"
            )
        else:
            lines.append(
                f"  {{ src: '{js_string(src)}', alt: '{js_string(Path(name).stem)} {i + 1}' }}"
            )

    images_array = ",\n".join(lines)

    content = f"""export const metadata = {{
  title: '{js_string(args.title)}',
  subtitle: '{js_string(args.summary)}',
  date: '{js_string(args.date)}'
}}

export const images = [
{images_array}
]"""
    return content


def _find_matching_brace(content: str, open_index: int) -> int:
    depth = 0
    for i in range(open_index, len(content)):
        ch = content[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return i
    raise ValueError("Unmatched brace in JS file.")


def _ensure_trailing_comma(block: str) -> str:
    stripped = block.rstrip()
    if not stripped:
        return block
    if stripped.endswith(","):
        return block
    trailing_ws = block[len(stripped):]
    return stripped + "," + trailing_ws


def append_category_item(file_path: Path, category: str, new_item: dict) -> bool:
    """Append new item object to category list file. Returns True if updated."""
    if not file_path.exists():
        raise SystemExit(f"Category list file not found: {file_path}")

    content = file_path.read_text(encoding="utf-8")
    item_id = new_item["id"]
    if re.search(rf"id:\s*['\"]{re.escape(item_id)}['\"]", content):
        print(f"Item with ID '{item_id}' already exists in {file_path}. Skipping list update.")
        return False

    list_name = f"{category}Items"
    list_match = re.search(rf"export const {re.escape(list_name)}\s*=\s*\[", content)
    if not list_match:
        raise SystemExit(f"Could not find array export for {list_name} in {file_path}")

    array_open_idx = content.find("[", list_match.start())
    array_close_idx = content.find("]", array_open_idx)
    if array_open_idx == -1 or array_close_idx == -1:
        raise SystemExit(f"Could not locate array bounds in {file_path}")

    array_inner = content[array_open_idx + 1:array_close_idx]
    entry = (
        "  { "
        f"id: '{js_string(new_item['id'])}', "
        f"title: '{js_string(new_item['title'])}', "
        f"date: '{js_string(new_item['date'])}', "
        f"count: {new_item['count']}, "
        f"note: '{js_string(new_item['note'])}', "
        f"coverImage: '{js_string(new_item['coverImage'])}' "
        "}"
    )

    if array_inner.strip():
        updated_inner = _ensure_trailing_comma(array_inner.rstrip()) + "\n" + entry + "\n"
    else:
        updated_inner = "\n" + entry + "\n"

    content = content[:array_open_idx + 1] + updated_inner + content[array_close_idx:]
    file_path.write_text(content, encoding="utf-8")
    print(f"Added new item to {file_path}.")
    return True


def update_items_js(file_path: Path, item_id: str, category: str, output_rel_path: str):
    """Update items.js to add new loader and category map entry."""
    if not file_path.exists():
        raise SystemExit(f"items.js not found at {file_path}")
    
    content = file_path.read_text(encoding="utf-8")
    
    # Check if already exists
    if re.search(rf"{re.escape(item_id)}\s*:", content):
        print(f"Item '{item_id}' already registered in items.js. Skipping.")
        return
    
    # Ensure import path starts with ./
    if not output_rel_path.startswith("./"):
        output_rel_path = "./" + output_rel_path

    # --- Update itemLoaders.<category> ---
    cat_open_pattern = rf"^(\s*){re.escape(category)}\s*:\s*\{{"
    cat_match = re.search(cat_open_pattern, content, re.MULTILINE)
    if not cat_match:
        print(f"Warning: Could not find category '{category}' in itemLoaders. Skipping loader update.")
    else:
        cat_indent = cat_match.group(1)
        cat_open_idx = content.find("{", cat_match.start())
        cat_close_idx = _find_matching_brace(content, cat_open_idx)
        cat_inner = content[cat_open_idx + 1:cat_close_idx]

        if not re.search(rf"['\"]{re.escape(item_id)}['\"]\s*:", cat_inner):
            entry_indent = cat_indent + "    "
            loader_entry = (
                f"{entry_indent}'{js_string(item_id)}': () =>\n"
                f"{entry_indent}    import('{js_string(output_rel_path)}')"
            )
            if cat_inner.strip():
                updated_inner = _ensure_trailing_comma(cat_inner.rstrip()) + "\n" + loader_entry + "\n" + cat_indent
            else:
                updated_inner = "\n" + loader_entry + "\n" + cat_indent

            content = content[:cat_open_idx + 1] + updated_inner + content[cat_close_idx:]
        else:
            print(f"Item '{item_id}' already exists in itemLoaders.{category}. Skipping loader update.")

    # --- Update itemCategoryMap ---
    map_match = re.search(r"export const itemCategoryMap\s*=\s*\{", content)
    if map_match:
        map_open_idx = content.find("{", map_match.start())
        map_close_idx = _find_matching_brace(content, map_open_idx)
        map_inner = content[map_open_idx + 1:map_close_idx]

        if not re.search(rf"['\"]{re.escape(item_id)}['\"]\s*:", map_inner):
            indent_match = re.search(r"\n(\s*)['\"]?[\w-]+['\"]?\s*:", map_inner)
            map_indent = indent_match.group(1) if indent_match else "    "
            map_entry = f"{map_indent}'{js_string(item_id)}': '{js_string(category)}'"
            if map_inner.strip():
                updated_map_inner = _ensure_trailing_comma(map_inner.rstrip()) + "\n" + map_entry + "\n"
            else:
                updated_map_inner = "\n" + map_entry + "\n"
            content = content[:map_open_idx + 1] + updated_map_inner + content[map_close_idx:]
        else:
            print(f"Item '{item_id}' already exists in itemCategoryMap. Skipping map update.")
    
    file_path.write_text(content, encoding="utf-8")
    print(f"Updated {file_path} with new loader and category mapping.")


def main() -> None:
    args = parse_args()
    input_dir = Path(args.input).resolve()

    if not input_dir.exists() or not input_dir.is_dir():
        raise SystemExit(f"Input folder does not exist: {input_dir}")

    image_names = collect_images(input_dir)
    if not image_names:
        raise SystemExit(f"No supported images found in: {input_dir}")

    project_root = Path(args.project_root).resolve()
    
    # 1. Generate item detail file
    output_path = Path(args.output).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    content = build_item_output(args, image_names)
    output_path.write_text(content, encoding="utf-8")
    print(f"Generated item file: {output_path} with {len(image_names)} images.")

    # 2. Compute relative path from items.js to the output file
    try:
        output_rel_path = output_path.relative_to(project_root / "src" / "gallery").as_posix()
    except ValueError:
        output_rel_path = output_path.as_posix()

    # 3. Update items.js (loader registry)
    items_js_path = project_root / ITEMS_JS_PATH
    update_items_js(items_js_path, args.id, args.category, output_rel_path)

    # 4. Add entry to category list file
    list_file_path = project_root / CATEGORY_LIST_FILES[args.category]

    base_path = args.base_path.rstrip("/").replace("\\", "/")
    if base_path.startswith("."):
        base_path = base_path.split(".")[-1]
    thumb_subdir = (args.thumb_subdir or "").strip().strip("/")
    if image_names:
        if thumb_subdir:
            cover_image = _web_join(base_path, thumb_subdir, image_names[0])
        else:
            cover_image = _web_join(base_path, image_names[0])
    else:
        cover_image = ""
    new_item = {
        'id': args.id,
        'title': args.title,
        'date': args.date,
        'count': len(image_names),
        'note': args.summary,
        'coverImage': cover_image
    }
    append_category_item(list_file_path, args.category, new_item)


if __name__ == "__main__":
    main()
