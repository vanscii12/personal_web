from __future__ import annotations

import argparse
import json
import re
from datetime import datetime
from pathlib import Path


SECTION_COMMANDS = [
    (r"\\section\*?\{([^{}]+)\}", "## {text}"),
    (r"\\subsection\*?\{([^{}]+)\}", "### {text}"),
    (r"\\subsubsection\*?\{([^{}]+)\}", "#### {text}"),
]

MATH_ENVIRONMENTS = [
    "equation",
    "equation*",
    "align",
    "align*",
    "gather",
    "gather*",
]


INLINE_TEXT_COMMANDS = {
    # Keep plain text because note renderer does not parse Markdown.
    "textit": "{text}",
    "emph": "{text}",
    "textbf": "{text}",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert a LaTeX .tex file into a web note JS module."
    )
    parser.add_argument("input", help="Input .tex file path.")
    parser.add_argument(
        "-o",
        "--output",
        help="Output .js file path. Defaults to src/notes/<id>.js in current workspace.",
    )
    parser.add_argument("--id", help="Note id. Defaults to slugified title or file name.")
    parser.add_argument("--title", help="Note title. Defaults to LaTeX \\title{} or file stem.")
    parser.add_argument("--category", default="Physics", help="Metadata category.")
    parser.add_argument("--description", default="", help="Metadata description.")
    parser.add_argument(
        "--tags",
        default="",
        help="Comma-separated tags, e.g. 'Physics,Electrodynamics'.",
    )
    parser.add_argument(
        "--date",
        default=str(datetime.now().year),
        help="Metadata date text. Defaults to current year.",
    )
    parser.add_argument(
        "--keep-preamble",
        action="store_true",
        help="Keep preamble content instead of extracting \\begin{document} body only.",
    )
    parser.add_argument(
        "--no-section-convert",
        action="store_true",
        help="Do not convert \\section commands to Markdown headings.",
    )
    return parser.parse_args()


def slugify(text: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "-", text.strip().lower())
    return cleaned.strip("-") or "untitled-note"


def extract_title(raw_tex: str, fallback: str) -> str:
    match = re.search(r"\\title\{([^{}]+)\}", raw_tex)
    if match:
        return match.group(1).strip()
    return fallback


def extract_document_body(raw_tex: str, keep_preamble: bool) -> str:
    if keep_preamble:
        return raw_tex

    match = re.search(
        r"\\begin\{document\}(.*?)\\end\{document\}",
        raw_tex,
        flags=re.DOTALL,
    )
    if match:
        return match.group(1)
    return raw_tex


def strip_latex_comments(text: str) -> str:
    cleaned_lines: list[str] = []
    for line in text.splitlines():
        line = re.sub(r"(?<!\\)%.*$", "", line)
        cleaned_lines.append(line.rstrip())
    return "\n".join(cleaned_lines)


def replace_math_environments(text: str) -> str:
    for env in MATH_ENVIRONMENTS:
        begin_pattern = re.compile(rf"\\begin\{{{re.escape(env)}\}}")
        end_pattern = re.compile(rf"\\end\{{{re.escape(env)}\}}")
        text = begin_pattern.sub("$$\n", text)
        text = end_pattern.sub("\n$$", text)

    text = re.sub(r"\\\[(.*?)\\\]", r"$$\n\1\n$$", text, flags=re.DOTALL)
    text = re.sub(r"\\\((.*?)\\\)", r"$\1$", text, flags=re.DOTALL)
    return text


def replace_sections(text: str) -> str:
    for pattern, template in SECTION_COMMANDS:
        text = re.sub(pattern, lambda m: template.format(text=m.group(1).strip()), text)
    return text


def replace_inline_text_commands(text: str) -> str:
    for command, template in INLINE_TEXT_COMMANDS.items():
        pattern = re.compile(rf"\\{command}\{{([^{{}}]+)\}}")
        text = pattern.sub(lambda m: template.format(text=m.group(1).strip()), text)
    return text


def remove_layout_environments(text: str) -> str:
    envs = ["center", "flushleft", "flushright"]
    for env in envs:
        text = re.sub(rf"\\begin\{{{env}\}}", "", text)
        text = re.sub(rf"\\end\{{{env}\}}", "", text)
    return text


def normalize_inline_latex_commands(text: str) -> str:
    text = re.sub(r"\\eqref\{([^{}]+)\}", r"(\1)", text)
    text = re.sub(r"\\ref\{([^{}]+)\}", r"\1", text)
    text = text.replace("~", " ")
    text = re.sub(r"\{\\LARGE\s+\\bf\s+([^{}]+)\}", r"\1", text)
    return text


def remove_noise_commands(text: str) -> str:
    text = re.sub(r"\\maketitle\b", "", text)
    text = re.sub(r"\\tableofcontents\b", "", text)
    text = re.sub(r"\\title\{[^{}]*\}", "", text)
    text = re.sub(r"\\author\{[^{}]*\}", "", text)
    text = re.sub(r"\\date\{[^{}]*\}", "", text)
    text = re.sub(r"\\thispagestyle\{[^{}]*\}", "", text)
    text = re.sub(r"\\(?:newpage|clearpage)\b", "", text)
    text = re.sub(r"\\label\{[^{}]*\}", "", text)
    return text


def normalize_spacing(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip() + "\n"


def collapse_multiline_display_math(text: str) -> str:
    lines = text.split("\n")
    output: list[str] = []
    in_block = False
    block_lines: list[str] = []

    for line in lines:
        stripped = line.strip()
        if stripped == "$$":
            if not in_block:
                in_block = True
                block_lines = []
            else:
                expr = " ".join(part.strip() for part in block_lines if part.strip())
                output.append(f"$$ {expr} $$" if expr else "$$ $$")
                in_block = False
                block_lines = []
            continue

        if in_block:
            block_lines.append(line)
            continue

        output.append(line)

    # Fallback for unclosed $$ blocks: preserve original delimiter style.
    if in_block:
        output.append("$$")
        output.extend(block_lines)

    return "\n".join(output)


def remove_leading_redundant_title(text: str, title: str) -> str:
    lines = text.splitlines()
    normalized_title = title.strip()
    while lines and not lines[0].strip():
        lines.pop(0)
    if lines and lines[0].strip() == normalized_title:
        lines.pop(0)
    return "\n".join(lines)


def escape_for_js_template(text: str) -> str:
    return (
        text.replace("\\", "\\\\")
        .replace("`", "\\`")
        .replace("${", "\\${")
    )


def parse_tags(raw_tags: str) -> list[str]:
    if not raw_tags.strip():
        return []
    return [tag.strip() for tag in raw_tags.split(",") if tag.strip()]


def format_js_array(values: list[str]) -> str:
    if not values:
        return "[]"
    return "[" + ", ".join(f"'{value}'" for value in values) + "]"


def build_js_module(
    note_id: str,
    title: str,
    category: str,
    description: str,
    tags: list[str],
    date: str,
    content: str,
) -> str:
    escaped_content = escape_for_js_template(content)
    title_literal = json.dumps(title, ensure_ascii=False)
    description_literal = json.dumps(description, ensure_ascii=False)
    return "\n".join(
        [
            "export const metadata = {",
            f"  id: '{note_id}',",
            f"  title: {title_literal},",
            f"  category: '{category}',",
            f"  description: {description_literal},",
            f"  tags: {format_js_array(tags)},",
            f"  date: '{date}'",
            "}",
            "",
            "export const content = `",
            escaped_content.rstrip(),
            "`",
            "",
        ]
    )


def resolve_output_path(output_arg: str | None, note_id: str) -> Path:
    if output_arg:
        return Path(output_arg).resolve()
    return (Path.cwd() / "src" / "notes" / f"{note_id}.js").resolve()


def main() -> None:
    args = parse_args()
    input_path = Path(args.input).resolve()
    if not input_path.exists() or not input_path.is_file():
        raise SystemExit(f"Input .tex file not found: {input_path}")

    raw_tex = input_path.read_text(encoding="utf-8")
    default_title = input_path.stem.replace("-", " ").strip() or "Untitled Note"
    title = args.title or extract_title(raw_tex, default_title)
    note_id = args.id or slugify(title)

    body = extract_document_body(raw_tex, args.keep_preamble)
    body = strip_latex_comments(body)
    body = remove_noise_commands(body)
    body = remove_layout_environments(body)
    body = normalize_inline_latex_commands(body)
    body = replace_math_environments(body)
    body = replace_inline_text_commands(body)
    if not args.no_section_convert:
        body = replace_sections(body)
    body = remove_leading_redundant_title(body, title)
    body = normalize_spacing(body)

    output_path = resolve_output_path(args.output, note_id)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_js = build_js_module(
        note_id=note_id,
        title=title,
        category=args.category,
        description=args.description,
        tags=parse_tags(args.tags),
        date=args.date,
        content=body,
    )
    output_path.write_text(output_js, encoding="utf-8")

    print(f"Converted {input_path} -> {output_path}")
    print(f"note id: {note_id}")


if __name__ == "__main__":
    main()
