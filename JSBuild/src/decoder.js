// decoder.js
// Unified chat/text → JSON decoder module
// Electron-safe, no CLI, no side effects

import fs   from "fs";
import path from "path";

export class Decoder {
  constructor() {
    this.commonPatterns = [
      /^{{(\w+)}}:/i,
      /^(\w+):/i,
      /^\[(\w+)\]/i,
      /^<(\w+)>/i,
      /^(\w+)\s*\|/i,
    ];
  }

  // ----------------------------------------
  // PUBLIC API
  // ----------------------------------------

  async decodeDirectory(inputDir, options = {}) {
    const {
      pattern = [".txt", ".chat", ".log"],
      mode = "raw", // "raw" | "chat"
      includeMetadata = false,
      preserveFormatting = true,
      outputDir = null,
    } = options;

    const results = {
      success: true,
      filesProcessed: 0,
      errors: [],
    };

    if (!fs.existsSync(inputDir)) {
      return {
        success: false,
        filesProcessed: 0,
        errors: [`Directory does not exist: ${inputDir}`],
      };
    }

    const files = fs
      .readdirSync(inputDir)
      .filter((file) =>
        pattern.includes(path.extname(file).toLowerCase())
      );

    for (const file of files) {
      const fullPath = path.join(inputDir, file);

      try {
        const content = fs.readFileSync(fullPath, "utf-8");

        let parsed;

        if (mode === "chat") {
          parsed = this.parseChat(content, file, {
            includeMetadata,
            preserveFormatting,
          });
        } else {
          parsed = this.parseRaw(content, file, {
            includeMetadata,
            preserveFormatting,
          });
        }

        const outputPath = outputDir
          ? path.join(outputDir, path.parse(file).name + ".json")
          : path.join(inputDir, path.parse(file).name + ".json");

        fs.writeFileSync(
          outputPath,
          JSON.stringify(parsed, null, 2),
          "utf-8"
        );

        results.filesProcessed++;

      } catch (err) {
        results.success = false;
        results.errors.push(`${file}: ${err.message}`);
      }
    }

    return results;
  }

  // ----------------------------------------
  // RAW MODE
  // ----------------------------------------

  parseRaw(content, filename, options) {
    const data = {
      title: path.parse(filename).name,
      content: options.preserveFormatting
        ? content
        : content.trim(),
    };

    if (options.includeMetadata) {
      data.metadata = {
        originalFilename: filename,
        timestamp: new Date().toISOString(),
        type: "raw",
      };
    }

    return data;
  }

  // ----------------------------------------
  // CHAT MODE
  // ----------------------------------------

  parseChat(content, filename, options) {
    const lines = content.split("\n");
    const parsed = [];

    let currentSpeaker = null;
    let currentText = [];

    for (let line of lines) {
      const trimmed = line.trim();
      let matched = false;

      for (const pattern of this.commonPatterns) {
        const match = trimmed.match(pattern);

        if (match) {
          if (currentSpeaker && currentText.length > 0) {
            parsed.push({
              speaker: currentSpeaker,
              text: currentText.join("\n").trim(),
            });
          }

          currentSpeaker = match[1].toLowerCase();
          currentText = [];

          const remaining = trimmed.slice(match[0].length).trim();
          if (remaining) currentText.push(remaining);

          matched = true;
          break;
        }
      }

      if (!matched && currentSpeaker) {
        currentText.push(line);
      }
    }

    if (currentSpeaker && currentText.length > 0) {
      parsed.push({
        speaker: currentSpeaker,
        text: currentText.join("\n").trim(),
      });
    }

    const data = {
      title: path.parse(filename).name,
      content: options.preserveFormatting
        ? content
        : this.reformatChat(parsed),
    };

    if (options.includeMetadata) {
      data.metadata = {
        originalFilename: filename,
        parsedEntries: parsed.length,
        timestamp: new Date().toISOString(),
        type: "chat",
      };
    }

    return data;
  }

  reformatChat(parsed) {
    return parsed
      .map((entry) => `${entry.speaker}:\n${entry.text}\n`)
      .join("\n")
      .trim();
  }
}