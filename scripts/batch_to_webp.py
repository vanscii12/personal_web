from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
THUMB_DIRNAME = "thumbs"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="批量将 JPG/PNG 图片转换为 WebP，并可同时生成网格用缩略图。"
    )
    parser.add_argument(
        "input",
        nargs="?",
        default=".",
        help="输入目录，默认当前目录。",
    )
    parser.add_argument(
        "-o",
        "--output",
        help="输出目录，默认输出到输入目录下的 webp-output 文件夹。",
    )
    parser.add_argument(
        "-q",
        "--quality",
        type=int,
        default=80,
        help="全图 WebP 质量，范围 0-100，默认 80。",
    )
    parser.add_argument(
        "--lossless",
        action="store_true",
        help="使用无损 WebP，启用后会忽略 quality。",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="若输出文件已存在则覆盖。",
    )
    parser.add_argument(
        "--no-thumb",
        action="store_true",
        help="不生成缩略图（默认会生成）。",
    )
    parser.add_argument(
        "--thumb-max-edge",
        type=int,
        default=1000,
        help="缩略图长边最大像素，默认 1000。",
    )
    parser.add_argument(
        "--thumb-quality",
        type=int,
        default=78,
        help="缩略图 WebP 质量 0-100，默认 78。",
    )
    return parser.parse_args()


def collect_images(input_dir: Path) -> list[Path]:
    return sorted(
        path
        for path in input_dir.rglob("*")
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    )


def _to_rgb(image: Image.Image) -> Image.Image:
    return (
        image.convert("RGBA")
        if image.mode in {"RGBA", "LA", "P"}
        else image.convert("RGB")
    )


def _save_webp(
    rgb: Image.Image,
    target_path: Path,
    quality: int,
    lossless: bool,
) -> None:
    save_options: dict = {"format": "WEBP", "method": 6}
    if lossless:
        save_options["lossless"] = True
    else:
        save_options["quality"] = quality
    rgb.save(target_path, **save_options)


def _save_thumb(
    rgb: Image.Image,
    thumb_path: Path,
    max_edge: int,
    quality: int,
) -> None:
    w, h = rgb.size
    scale = max_edge / max(w, h)
    if scale < 1:
        nw = max(1, int(w * scale))
        nh = max(1, int(h * scale))
        thumb = rgb.resize((nw, nh), Image.Resampling.LANCZOS)
    else:
        thumb = rgb
    thumb_path.parent.mkdir(parents=True, exist_ok=True)
    _save_webp(thumb, thumb_path, quality=quality, lossless=False)


def convert_image(
    source_path: Path,
    input_dir: Path,
    output_dir: Path,
    quality: int,
    lossless: bool,
    overwrite: bool,
    thumb_max_edge: int | None,
    thumb_quality: int,
) -> tuple[bool, str]:
    relative_path = source_path.relative_to(input_dir)
    target_path = (output_dir / relative_path).with_suffix(".webp")
    target_path.parent.mkdir(parents=True, exist_ok=True)

    thumb_path: Path | None = None
    if thumb_max_edge and thumb_max_edge > 0:
        thumb_path = target_path.parent / THUMB_DIRNAME / target_path.name

    need_full = overwrite or not target_path.exists()
    need_thumb = (
        thumb_path is not None
        and (overwrite or not thumb_path.exists())
    )

    if not need_full and not need_thumb:
        return False, f"跳过（已存在）: {target_path}"

    with Image.open(source_path) as image:
        image = ImageOps.exif_transpose(image)
        rgb = _to_rgb(image)

        if need_full:
            _save_webp(rgb, target_path, quality=quality, lossless=lossless)

        if need_thumb and thumb_path is not None:
            _save_thumb(rgb, thumb_path, thumb_max_edge, thumb_quality)

    parts = [f"{source_path} -> {target_path}"]
    if thumb_path and need_thumb:
        parts.append(f"+ {thumb_path}")
    return True, "完成: " + " ".join(parts)


def main() -> None:
    args = parse_args()
    input_dir = Path(args.input).resolve()
    output_dir = Path(args.output).resolve() if args.output else input_dir / "webp-output"

    if not input_dir.exists() or not input_dir.is_dir():
        raise SystemExit(f"输入目录不存在: {input_dir}")

    if not args.lossless and not 0 <= args.quality <= 100:
        raise SystemExit("quality 必须在 0 到 100 之间。")

    if not 0 <= args.thumb_quality <= 100:
        raise SystemExit("thumb-quality 必须在 0 到 100 之间。")

    thumb_max: int | None = None if args.no_thumb else args.thumb_max_edge
    if thumb_max is not None and thumb_max <= 0:
        raise SystemExit("thumb-max-edge 必须为正整数，或使用 --no-thumb。")

    image_paths = collect_images(input_dir)
    if not image_paths:
        print("未找到 JPG/PNG 图片。")
        return

    success_count = 0
    skipped_count = 0

    print(f"找到 {len(image_paths)} 张图片，开始转换...")
    if thumb_max:
        print(
            f"缩略图：长边 ≤ {thumb_max}px，质量 {args.thumb_quality}，"
            f"输出子目录「{THUMB_DIRNAME}/」"
        )
    for image_path in image_paths:
        try:
            converted, message = convert_image(
                source_path=image_path,
                input_dir=input_dir,
                output_dir=output_dir,
                quality=args.quality,
                lossless=args.lossless,
                overwrite=args.overwrite,
                thumb_max_edge=thumb_max,
                thumb_quality=args.thumb_quality,
            )
            print(message)
            if converted:
                success_count += 1
            else:
                skipped_count += 1
        except Exception as error:
            print(f"失败: {image_path} -> {error}")

    print(
        f"转换结束：成功 {success_count} 张，跳过 {skipped_count} 张，输出目录：{output_dir}"
    )


if __name__ == "__main__":
    main()
