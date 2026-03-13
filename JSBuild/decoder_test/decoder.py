import os
import re
import json
from datetime import datetime
from pathlib import Path

class Decoder:
    def __init__(self):
        self.common_patterns = [
            re.compile(r"^{{(\w+)}}:", re.I),
            re.compile(r"^(\w+):", re.I),
            re.compile(r"^\[(\w+)\]", re.I),
            re.compile(r"^<(\w+)>", re.I),
            re.compile(r"^(\w+)\s*\|", re.I),
        ]

    # ----------------------------------------
    # PUBLIC API
    # ----------------------------------------
    def decode_directory(self, input_dir, pattern=None, mode="raw",
                         include_metadata=False, preserve_formatting=True,
                         output_dir=None):
        if pattern is None:
            pattern = [".txt", ".chat", ".log"]

        results = {
            "success": True,
            "filesProcessed": 0,
            "errors": [],
        }

        input_path = Path(input_dir)
        if not input_path.exists() or not input_path.is_dir():
            results["success"] = False
            results["errors"].append(f"Directory does not exist: {input_dir}")
            return results

        files = [f for f in input_path.iterdir() if f.suffix.lower() in pattern]

        for file_path in files:
            try:
                content = file_path.read_text(encoding="utf-8")

                if mode == "chat":
                    parsed = self.parse_chat(content, file_path.name,
                                             include_metadata, preserve_formatting)
                else:
                    parsed = self.parse_raw(content, file_path.name,
                                            include_metadata, preserve_formatting)

                out_dir = Path(output_dir) if output_dir else input_path
                out_dir.mkdir(parents=True, exist_ok=True)
                output_path = out_dir / f"{file_path.stem}.json"

                output_path.write_text(json.dumps(parsed, indent=2, ensure_ascii=False),
                                       encoding="utf-8")
                results["filesProcessed"] += 1

            except Exception as e:
                results["success"] = False
                results["errors"].append(f"{file_path.name}: {str(e)}")

        return results

    # ----------------------------------------
    # RAW MODE
    # ----------------------------------------
    def parse_raw(self, content, filename, include_metadata, preserve_formatting):
        data = {
            "title": Path(filename).stem,
            "content": content if preserve_formatting else content.strip()
        }

        if include_metadata:
            data["metadata"] = {
                "originalFilename": filename,
                "timestamp": datetime.utcnow().isoformat(),
                "type": "raw"
            }

        return data

    # ----------------------------------------
    # CHAT MODE
    # ----------------------------------------
    def parse_chat(self, content, filename, include_metadata, preserve_formatting):
        lines = content.splitlines()
        parsed = []

        current_speaker = None
        current_text = []

        for line in lines:
            trimmed = line.strip()
            matched = False

            for pattern in self.common_patterns:
                match = pattern.match(trimmed)
                if match:
                    if current_speaker and current_text:
                        parsed.append({
                            "speaker": current_speaker.lower(),
                            "text": "\n".join(current_text).strip()
                        })

                    current_speaker = match.group(1)
                    current_text = []

                    remaining = trimmed[match.end():].strip()
                    if remaining:
                        current_text.append(remaining)
                    matched = True
                    break

            if not matched and current_speaker:
                current_text.append(line)

        if current_speaker and current_text:
            parsed.append({
                "speaker": current_speaker.lower(),
                "text": "\n".join(current_text).strip()
            })

        data = {
            "title": Path(filename).stem,
            "content": content if preserve_formatting else self.reformat_chat(parsed)
        }

        if include_metadata:
            data["metadata"] = {
                "originalFilename": filename,
                "parsedEntries": len(parsed),
                "timestamp": datetime.utcnow().isoformat(),
                "type": "chat"
            }

        return data

    def reformat_chat(self, parsed):
        return "\n\n".join(f"{entry['speaker']}:\n{entry['text']}" for entry in parsed)
