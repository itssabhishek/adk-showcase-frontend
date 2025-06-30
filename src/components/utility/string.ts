// src/utils/stringUtils.js (or your file path)

export const removeSpacings = (value: string) =>
  value.split(' ').join('_').toLocaleLowerCase();

export const removeAfter = (value: string, symbols: string[]) => {
  let result = value;
  symbols.forEach((symbol) => {
    const index = result.indexOf(symbol);
    if (index !== -1) {
      result = result.substring(0, index);
    }
  });
  return result;
};

export function chunkTextSmart(
  text: string,
  chunkSize = 300,
  chunkTolerance = 50
): string[] {
  const sentences = text
    .replace(/\n+/g, ' ')
    .split(/([.?!])/)
    .reduce((acc, val, idx, arr) => {
      if (/[.?!]/.test(val) && acc.length) {
        acc[acc.length - 1] += val;
      } else if (val.trim()) {
        acc.push(val.trim());
      }
      return acc;
    }, [] as string[]);

  const chunks: string[] = [];
  let current = '';

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const nextLen = current.length + sentence.length + 1;
    if (
      current.length === 0 ||
      nextLen < chunkSize ||
      (nextLen <= chunkSize + chunkTolerance && nextLen > chunkSize)
    ) {
      if (!current) current = sentence;
      else current += ' ' + sentence;
    } else {
      chunks.push(current);
      current = sentence;
    }
  }
  if (current) chunks.push(current);

  return chunks.map((c) => c.trim());
}

/**
 * Safeguards user-facing chat text coming from an LLM from leaking JSON objects.
 * If text extraction fails, it logs a warning and returns an empty string.
 */
export function PreventJsonLeaking(rawText) {
  if (typeof rawText !== 'string') {
    return String(rawText);
  }

  const textToProcess = rawText.trim();
  if (textToProcess === '') return '';

  const commonKeys = [
    'text',
    'message',
    'content',
    'response',
    'reply',
    'output',
    'answer',
    'completion',
  ];

  const finalizeString = (str) => {
    if (typeof str !== 'string') return String(str);
    return str.replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
  };

  const prepareStringForJsonParse = (jsonStringCandidate) => {
    if (typeof jsonStringCandidate !== 'string') return jsonStringCandidate;
    return jsonStringCandidate
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\\\/g, '\\');
  };

  // --- Layer 1: Direct JSON.parse of the whole string ---
  try {
    const parsedL1 = JSON.parse(textToProcess);
    if (typeof parsedL1 === 'object' && parsedL1 !== null) {
      for (const key of commonKeys) {
        if (typeof parsedL1[key] === 'string') {
          return finalizeString(parsedL1[key]);
        }
      }
      console.warn(
        'PreventJsonLeaking: [L1] Structured data format received, but no common key found.',
        { originalText: rawText, parsedObject: parsedL1 }
      );
      return '';
    }
    if (typeof parsedL1 === 'string') {
      if (
        textToProcess.startsWith('"') &&
        textToProcess.endsWith('"') &&
        textToProcess.length > 2
      ) {
        // Fall through to Layer 2
      } else {
        return finalizeString(parsedL1);
      }
    }
    if (
      typeof parsedL1 === 'number' ||
      typeof parsedL1 === 'boolean' ||
      parsedL1 === null
    ) {
      return String(parsedL1);
    }
  } catch (e) {
    /* Fall through */
  }

  // --- Layer 2: Stringified JSON ---
  if (
    textToProcess.startsWith('"') &&
    textToProcess.endsWith('"') &&
    textToProcess.length > 2
  ) {
    try {
      const unescapedOuterString = JSON.parse(textToProcess);
      if (typeof unescapedOuterString === 'string') {
        const preparedInnerJsonString =
          prepareStringForJsonParse(unescapedOuterString);
        try {
          const parsedInner = JSON.parse(preparedInnerJsonString);
          if (typeof parsedInner === 'object' && parsedInner !== null) {
            for (const key of commonKeys) {
              if (typeof parsedInner[key] === 'string') {
                return finalizeString(parsedInner[key]);
              }
            }
            console.warn(/* ... L2 no common key ... */);
            return '';
          }
          if (typeof parsedInner === 'string')
            return finalizeString(parsedInner);
          if (
            typeof parsedInner === 'number' ||
            typeof parsedInner === 'boolean' ||
            parsedInner === null
          ) {
            return String(parsedInner);
          }
        } catch (e2) {
          return finalizeString(unescapedOuterString); // If inner parse fails, outer string was the content
        }
      }
    } catch (e1) {
      /* Fall through */
    }
  }

  // --- Layer 3: Markdown JSON code block (entire string) ---
  const markdownWholeMatch = textToProcess.match(
    /^```json\s*([\s\S]+?)\s*```$/
  );
  if (markdownWholeMatch && markdownWholeMatch[1]) {
    try {
      const content = markdownWholeMatch[1];
      const parsed = JSON.parse(content);
      if (typeof parsed === 'object' && parsed !== null) {
        for (const key of commonKeys) {
          if (typeof parsed[key] === 'string') {
            return finalizeString(parsed[key]);
          }
        }
        console.warn(/* ... L3 no common key ... */);
        return '';
      }
      if (typeof parsed === 'string') return finalizeString(parsed);
      if (
        typeof parsed === 'number' ||
        typeof parsed === 'boolean' ||
        parsed === null
      )
        return String(parsed);
    } catch (e) {
      console.warn(/* ... L3 malformed ... */);
      return '';
    }
  }

  // Helper for Layers 4a and 4b
  const checkAndReturnForTrailingBlock = (
    blockContent,
    blockStartIndex,
    isMarkdownContent = false
  ) => {
    try {
      const preparedContent = isMarkdownContent
        ? blockContent
        : prepareStringForJsonParse(blockContent);
      const parsed = JSON.parse(preparedContent);

      if (typeof parsed === 'object' && parsed !== null) {
        for (const key of commonKeys) {
          if (typeof parsed[key] === 'string') {
            const textBefore = textToProcess
              .substring(0, blockStartIndex)
              .trim();
            const isIgnorablePrefix =
              textBefore.length === 0 ||
              textBefore.toLowerCase().endsWith(':') ||
              textBefore.toLowerCase().includes('thought:') ||
              textBefore.toLowerCase().includes('action:');
            if (isIgnorablePrefix) {
              return finalizeString(parsed[key]);
            }
          }
        }
      }
    } catch (e) {
      /* Malformed or not an object, ignore */
    }
    return null; // Indicate no extraction or conditions not met
  };

  // --- Layer 4a: Extract from *last* markdown JSON block in mixed content ---
  const lastMarkdownRegex = /```json\s*([\s\S]+?)\s*```(?![^`]*```json)/s;
  const lastMarkdownMatchResult = textToProcess.match(lastMarkdownRegex);
  if (lastMarkdownMatchResult && lastMarkdownMatchResult[1]) {
    const textAfterMarkdown = textToProcess
      .substring(
        lastMarkdownMatchResult.index + lastMarkdownMatchResult[0].length
      )
      .trim();
    if (textAfterMarkdown === '') {
      // Only if it's the last meaningful content
      const extracted = checkAndReturnForTrailingBlock(
        lastMarkdownMatchResult[1],
        lastMarkdownMatchResult.index,
        true
      );
      if (extracted !== null) return extracted;
    }
  }

  // --- Layer 4b: Try to find last simple JSON object block (non-regex approach) ---
  let L4b_lastJsonBlockCandidate = null;
  let L4b_lastJsonBlockStartIndex = -1;
  let L4b_braceBalance = 0;
  let L4b_endIndex = -1;

  for (let i = textToProcess.length - 1; i >= 0; i--) {
    const char = textToProcess[i];
    if (char === '}') {
      if (L4b_braceBalance === 0) {
        L4b_endIndex = i;
      }
      L4b_braceBalance++;
    } else if (char === '{') {
      L4b_braceBalance--;
      if (L4b_braceBalance === 0 && L4b_endIndex !== -1) {
        // Found a balanced {}. Check if it's a distinct block.
        const charBeforeStart = textToProcess[i - 1];
        const isBlockStart =
          i === 0 ||
          charBeforeStart === undefined ||
          charBeforeStart === '\n' ||
          /\s/.test(charBeforeStart) ||
          charBeforeStart === ':';

        if (isBlockStart) {
          L4b_lastJsonBlockCandidate = textToProcess.substring(
            i,
            L4b_endIndex + 1
          );
          L4b_lastJsonBlockStartIndex = i;
          break;
        } else {
          // It's embedded, reset to find another potential block further left.
          L4b_braceBalance = 0;
          L4b_endIndex = -1;
        }
      }
    }
  }

  if (L4b_lastJsonBlockCandidate) {
    const extracted = checkAndReturnForTrailingBlock(
      L4b_lastJsonBlockCandidate,
      L4b_lastJsonBlockStartIndex,
      false
    );
    if (extracted !== null) return extracted;
  }

  // --- Layer 5: Regex for slightly malformed full JSON objects ---
  if (textToProcess.startsWith('{') && textToProcess.endsWith('}')) {
    let parseFailedForL5 = false;
    try {
      JSON.parse(textToProcess);
    } catch {
      parseFailedForL5 = true;
    }

    if (parseFailedForL5) {
      const regexPatterns = commonKeys.map(
        (key) => new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`)
      );
      for (const pattern of regexPatterns) {
        const match = textToProcess.match(pattern);
        if (match && match[1]) {
          if (match[0].length > textToProcess.length * 0.5) {
            return finalizeString(match[1]);
          }
        }
      }
    }
  }

  // --- Final Fallback ---
  const isLikelyJsonStructure = (str) => {
    const trimmed = str.trim();
    return (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    );
  };

  if (isLikelyJsonStructure(textToProcess)) {
    let directParseFailed = false;
    try {
      const parsedForFallback = JSON.parse(textToProcess);
      if (typeof parsedForFallback === 'object' && parsedForFallback !== null) {
        // Layer 1 would have handled objects with common keys.
        // If it's an object without common keys, or an array, return ''.
        console.warn(
          'PreventJsonLeaking: [Fallback] Parsed as JSON structure but no common key extracted.',
          { originalText: rawText }
        );
        return '';
      }
    } catch {
      directParseFailed = true;
    }
    if (directParseFailed) {
      console.warn(
        'PreventJsonLeaking: [Fallback] Likely JSON but unparsable and not handled.',
        { originalText: rawText }
      );
      return '';
    }
  }

  return textToProcess;
}
