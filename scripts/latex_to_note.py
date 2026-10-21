from __future__ import annotations

import argparse
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Callable, Optional, Tuple


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


def extract_braced_content(text: str, start_index: int) -> Optional[Tuple[str, int]]:
    """
    Finds the balanced {...} starting from start_index (where text[start_index] == '{'
    or the next '{' after start_index).
    Returns (inner_content, end_pos_after_closing_brace).
    Properly handles escaped braces \\{ and \\}.
    """
    open_pos = text.find("{", start_index)
    if open_pos == -1:
        return None

    depth = 1
    i = open_pos + 1
    length = len(text)

    while i < length and depth > 0:
        char = text[i]
        if char == "\\":
            i += 2
            continue
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
        i += 1

    if depth == 0:
        return (text[open_pos + 1 : i - 1], i)
    return None


def replace_command_with_braces(
    text: str, command: str, handler: Callable[[str], str]
) -> str:
    """
    Replaces LaTeX commands with balanced braces like \\section{...} or \\textbf{...}.
    Supports optional asterisk (e.g. \\section*{...}) and nested braces.
    """
    pattern = re.compile(rf"\\{re.escape(command)}\*?\s*\{{")
    pos = 0

    while True:
        match = pattern.search(text, pos)
        if not match:
            break

        brace_start = match.end() - 1
        res = extract_braced_content(text, brace_start)
        if not res:
            pos = match.end()
            continue

        inner, end_pos = res
        replacement = handler(inner)
        text = text[: match.start()] + replacement + text[end_pos:]
        pos = match.start() + len(replacement)

    return text


def extract_title(raw_tex: str, fallback: str) -> str:
    match = re.search(r"\\title\*?\s*\{", raw_tex)
    if match:
        res = extract_braced_content(raw_tex, match.end() - 1)
        if res:
            title_text = res[0].strip()
            # Clean basic inline formatting from title
            title_text = re.sub(r"\\[a-zA-Z]+\{([^{}]*)\}", r"\1", title_text)
            title_text = re.sub(r"\\\\", " ", title_text)
            return title_text.strip()
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
    """
    Strips LaTeX comments starting with % unless escaped as \\%.
    Correctly treats \\\\% as a newline followed by a comment.
    """
    cleaned_lines: list[str] = []
    for line in text.splitlines():
        # Find % that is not escaped
        i = 0
        in_comment = False
        comment_pos = -1
        while i < len(line):
            if line[i] == "%":
                # Check preceding backslashes
                num_bs = 0
                k = i - 1
                while k >= 0 and line[k] == "\\":
                    num_bs += 1
                    k -= 1
                # If even number of backslashes (e.g. 0 or 2 for \\%), it's a comment
                if num_bs % 2 == 0:
                    in_comment = True
                    comment_pos = i
                    break
            i += 1

        if in_comment:
            cleaned_lines.append(line[:comment_pos].rstrip())
        else:
            cleaned_lines.append(line.rstrip())

    return "\n".join(cleaned_lines)


def replace_math_environments(text: str) -> str:
    r"""
    Normalizes LaTeX math environments.
    - Preserves \begin{equation} and \begin{equation*} so MathJax can auto-number
      and support \label and \boxed without errors.
    - Preserves \begin{align} and \begin{align*} so MathJax handles multi-line alignment natively.
    - Preserves \begin{gather} and \begin{gather*}.
    - Converts \[ ... \] to $$ ... $$.
    - Converts \( ... \) to $ ... $.
    - If a $$ ... $$ block contains a \label, wraps it in \begin{equation} so MathJax allows the label.
    """
    # \[ ... \] -> $$ ... $$
    text = re.sub(r"\\\[(.*?)\\\]", r"$$\n\1\n$$", text, flags=re.DOTALL)
    # \( ... \) -> $ ... $
    text = re.sub(r"\\\((.*?)\\\)", r"$\1$", text, flags=re.DOTALL)

    # If any $$ ... $$ block contains a \label{...}, convert it to \begin{equation} ... \end{equation}
    # because MathJax with autoNumber: AMS throws an error on \label inside unnumbered $$
    def fix_unsupported_label_in_dollar(m: re.Match) -> str:
        inner = m.group(1)
        if re.search(r"\\label\{[^{}]*\}", inner):
            return f"\n\n\\begin{{equation}}\n{inner.strip()}\n\\end{{equation}}\n\n"
        return f"\n\n$${inner}$$\n\n"

    text = re.sub(r"\$\$(.*?)\$\$", fix_unsupported_label_in_dollar, text, flags=re.DOTALL)

    return text


def replace_sections(text: str) -> str:
    """
    Converts section commands to Markdown headings using balanced brace parsing.
    """
    text = replace_command_with_braces(text, "section", lambda t: f"\n\n## {t.strip()}\n\n")
    text = replace_command_with_braces(text, "subsection", lambda t: f"\n\n### {t.strip()}\n\n")
    text = replace_command_with_braces(text, "subsubsection", lambda t: f"\n\n#### {t.strip()}\n\n")
    return text


def convert_lists(text: str) -> str:
    """
    Converts itemize and enumerate environments into Markdown lists.
    """
    def itemize_sub(m: re.Match) -> str:
        content = m.group(1)
        items = re.split(r"\\item\s+", content)
        result = []
        for it in items:
            cleaned = it.strip()
            if cleaned:
                # Indent subsequent lines in multiline item
                lines = cleaned.splitlines()
                first = f"- {lines[0].strip()}"
                rest = [f"  {line.strip()}" for line in lines[1:] if line.strip()]
                result.append("\n".join([first] + rest))
        return "\n\n" + "\n".join(result) + "\n\n"

    def enumerate_sub(m: re.Match) -> str:
        content = m.group(1)
        items = re.split(r"\\item\s+", content)
        result = []
        idx = 1
        for it in items:
            cleaned = it.strip()
            if cleaned:
                lines = cleaned.splitlines()
                first = f"{idx}. {lines[0].strip()}"
                rest = [f"   {line.strip()}" for line in lines[1:] if line.strip()]
                result.append("\n".join([first] + rest))
                idx += 1
        return "\n\n" + "\n".join(result) + "\n\n"

    def description_sub(m: re.Match) -> str:
        content = m.group(1)
        items = re.split(r"\\item\s*\[(.*?)\]", content)
        result = []
        for i in range(1, len(items), 2):
            term = items[i].strip()
            definition = items[i + 1].strip() if i + 1 < len(items) else ""
            lines = definition.splitlines()
            first = f"- **{term}**: {lines[0].strip()}" if lines else f"- **{term}**"
            rest = [f"  {line.strip()}" for line in lines[1:] if line.strip()]
            result.append("\n".join([first] + rest))
        return "\n\n" + "\n".join(result) + "\n\n"

    text = re.sub(r"\\begin\{itemize\}(.*?)\\end\{itemize\}", itemize_sub, text, flags=re.DOTALL)
    text = re.sub(r"\\begin\{enumerate\}(.*?)\\end\{enumerate\}", enumerate_sub, text, flags=re.DOTALL)
    text = re.sub(r"\\begin\{description\}(.*?)\\end\{description\}", description_sub, text, flags=re.DOTALL)
    return text


def replace_inline_text_formatting(text: str) -> str:
    """
    Converts font styles to Markdown or HTML format with balanced brace extraction.
    """
    text = replace_command_with_braces(text, "textbf", lambda t: f"**{t.strip()}**")
    text = replace_command_with_braces(text, "textit", lambda t: f"*{t.strip()}*")
    text = replace_command_with_braces(text, "emph", lambda t: f"*{t.strip()}*")
    text = replace_command_with_braces(text, "texttt", lambda t: f"`{t.strip()}`")
    text = replace_command_with_braces(text, "underline", lambda t: f"<u>{t.strip()}</u>")
    return text


def remove_layout_environments(text: str) -> str:
    def figure_sub(m: re.Match) -> str:
        fig_content = m.group(1)
        caption_match = re.search(r"\\caption\*?\{([^{}]*)\}", fig_content)
        img_match = re.search(r"\\includegraphics\*?(?:\[.*?\])?\{([^{}]*)\}", fig_content)
        caption = caption_match.group(1).strip() if caption_match else ""
        if img_match:
            img_path = img_match.group(1).strip()
            return f"\n\n![{caption}]({img_path})\n\n"
        return ""

    text = re.sub(r"\\begin\{figure\*?\}(?:\[.*?\])?(.*?)\\end\{figure\*?\}", figure_sub, text, flags=re.DOTALL)
    text = re.sub(r"\\begin\{table\*?\}(?:\[.*?\])?(.*?)\\end\{table\*?\}", "", text, flags=re.DOTALL)

    envs = ["center", "flushleft", "flushright"]
    for env in envs:
        text = re.sub(rf"\\begin\{{{env}\*?\}}(?:\[.*?\])?", "", text)
        text = re.sub(rf"\\end\{{{env}\*?\}}", "", text)
    return text


def clean_math_and_references(text: str) -> str:
    """
    Normalizes references and labels:
    - Normalizes common macro variations like \\Ddot -> \\ddot and \\Dot -> \\dot.
    - Wraps \\eqref and \\ref into inline math ($\\\\eqref{...}$) so MathJax renders them.
    - Preserves \\label inside math, removes standalone \\label outside math.
    """
    # Normalize common LaTeX accents
    text = re.sub(r"\\Ddot\b", r"\\ddot", text)
    text = re.sub(r"\\Dot\b", r"\\dot", text)

    # Wrap text \eqref{...} into MathJax $\eqref{...}$ so equation numbering is dynamically resolved
    text = re.sub(r"(?<!\$)\\eqref\{([^{}]+)\}", r"$\\eqref{\1}$", text)
    text = re.sub(r"(?<!\$)\\ref\{([^{}]+)\}", r"$\\ref{\1}$", text)

    # Protect labels inside math ($$...$$ and \begin{equation/align/gather})
    math_pattern = re.compile(
        r"(\$\$.*?\$\$|\\begin\{(?:equation|align|gather)\*?\}[\s\S]*?\\end\{(?:equation|align|gather)\*?\})"
    )
    parts = math_pattern.split(text)
    for i in range(0, len(parts), 2):  # Even indices are text outside math
        parts[i] = re.sub(r"\\label\{[^{}]*\}", "", parts[i])
    return "".join(parts)


def replace_typography_and_escapes(text: str) -> str:
    """
    Converts LaTeX quotes, dashes, and unescapes text-mode characters outside math.
    """
    # Split text into math ($$, $, and \begin{equation/align/gather}) and non-math segments
    math_pattern = re.compile(
        r"(\$\$.*?\$\$|\$.*?\$|\\begin\{(?:equation|align|gather)\*?\}[\s\S]*?\\end\{(?:equation|align|gather)\*?\})"
    )
    parts = math_pattern.split(text)

    for i in range(0, len(parts), 2):
        chunk = parts[i]
        # Quotes: ``word'' -> “word”
        chunk = re.sub(r"``", "“", chunk)
        chunk = re.sub(r"''", "”", chunk)
        chunk = re.sub(r"`", "‘", chunk)
        chunk = re.sub(r"'", "’", chunk)

        # Dashes
        chunk = re.sub(r"---", "—", chunk)
        chunk = re.sub(r"--", "–", chunk)

        # Escaped characters in text mode
        chunk = re.sub(r"\\%", "%", chunk)
        chunk = re.sub(r"\\&", "&", chunk)
        chunk = re.sub(r"\\_", "_", chunk)
        chunk = re.sub(r"\\#", "#", chunk)

        # Non-breaking spaces
        chunk = chunk.replace("~", " ")

        # Remove trailing \\ from paragraphs/titles
        chunk = re.sub(r"\\\\\s*$", "", chunk, flags=re.MULTILINE)
        chunk = re.sub(r"\\\\", "\n", chunk)

        # Remove old font commands like {\LARGE \bf ...}
        chunk = re.sub(r"\{\\LARGE\s+\\bf\s+([^{}]+)\}", r"\1", chunk)
        chunk = re.sub(r"\{\\large\s+([^{}]+)\}", r"\1", chunk)

        parts[i] = chunk

    return "".join(parts)


def remove_noise_commands(text: str) -> str:
    """
    Removes structural LaTeX boilerplate that shouldn't appear in web notes.
    """
    noise_no_arg = [
        "maketitle",
        "tableofcontents",
        "newpage",
        "clearpage",
        "noindent",
        "centering",
    ]
    for cmd in noise_no_arg:
        text = re.sub(rf"\\{cmd}\b", "", text)

    noise_with_args = [
        "title",
        "author",
        "date",
        "thispagestyle",
        "pagestyle",
        "vspace",
        "hspace",
        "bibliographystyle",
        "bibliography",
    ]
    for cmd in noise_with_args:
        text = replace_command_with_braces(text, cmd, lambda _: "")

    return text


def normalize_spacing(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Clean up excessive newlines
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip() + "\n"


def remove_leading_redundant_title(text: str, title: str) -> str:
    lines = text.splitlines()
    normalized_title = title.strip().lower()
    while lines and not lines[0].strip():
        lines.pop(0)
    if lines:
        first_line = lines[0].strip().strip("#").strip().lower()
        if first_line == normalized_title:
            lines.pop(0)
    return "\n".join(lines)


def escape_for_js_template(text: str) -> str:
    """
    Escapes text safely for embedding into a JS template literal: `...`.
    """
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
    body = convert_lists(body)
    body = replace_math_environments(body)
    body = clean_math_and_references(body)
    body = replace_inline_text_formatting(body)
    if not args.no_section_convert:
        body = replace_sections(body)
    body = replace_typography_and_escapes(body)
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
