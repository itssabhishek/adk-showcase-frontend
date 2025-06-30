/* eslint-disable jest/valid-title */

import { PreventJsonLeaking } from '../string';

describe('PreventJsonLeaking', () => {
  let consoleWarnSpy;
  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  const testCases = [
    // 1. Plain text
    {
      description: 'Plain text: Hello, world!',
      input: 'Hello, world!',
      expected: 'Hello, world!',
    },
    {
      description: 'Plain text: Normal sentence',
      input: 'This is a normal sentence.',
      expected: 'This is a normal sentence.',
    },
    {
      description: 'Plain text: Leading/trailing spaces',
      input: '  Leading and trailing spaces.  ',
      expected: 'Leading and trailing spaces.',
    },

    // 2. Valid JSON strings with common text keys
    {
      description: "Valid JSON: key 'text'",
      input: '{"text":"This is the message."}',
      expected: 'This is the message.',
    },
    {
      description: "Valid JSON: key 'message'",
      input: '{"message":"Another message here."}',
      expected: 'Another message here.',
    },
    {
      description: "Valid JSON: key 'content'",
      input: '{"content":"Content field."}',
      expected: 'Content field.',
    },
    {
      description: "Valid JSON: key 'response'",
      input: '{"response":"Response text."}',
      expected: 'Response text.',
    },
    {
      description: "Valid JSON: key 'reply'",
      input: '{"reply":"A reply."}',
      expected: 'A reply.',
    },
    {
      description: "Valid JSON: key 'output'",
      input: '{"output":"Output data."}',
      expected: 'Output data.',
    },
    {
      description: "Valid JSON: key 'answer'",
      input: '{"answer":"The answer is 42."}',
      expected: 'The answer is 42.',
    },
    {
      description: "Valid JSON: key 'completion'",
      input: '{"completion":"Task completed."}',
      expected: 'Task completed.',
    },
    {
      description: 'Valid JSON: Spaced JSON',
      input: ' { "text" : " Spaced JSON " } ',
      expected: ' Spaced JSON ',
    },

    // 3. JSON with other fields but still a primary text field
    {
      description: "JSON with other fields: 'text' and 'action'",
      input: '{"text":"Main text", "action":"NONE"}',
      expected: 'Main text',
    },
    {
      description: "JSON with other fields: 'message' and 'id'",
      input: '{"id":123, "message":"Message with ID", "status":"ok"}',
      expected: 'Message with ID',
    },

    // 4. JSON strings with uncommon text keys
    {
      description: "JSON uncommon key: 'data'",
      input: '{"data":"Some data"}',
      expected: '', // Changed
    },
    {
      description: "JSON uncommon key: 'info'",
      input: '{"info":"Information"}',
      expected: '', // Changed
    },
    {
      description: "JSON uncommon key: 'value'",
      input: '{"value": "A value"}',
      expected: '', // Changed
    },

    // 5. Malformed JSON strings
    {
      description: 'Malformed JSON: Missing quote',
      input: '{"text":"Missing quote}',
      expected: '', // Changed
    },
    {
      description: 'Malformed JSON: No quotes around key',
      input: '{text:"No quotes around key"}',
      expected: '', // Changed
    },
    {
      description: 'Malformed JSON: Single quotes',
      input: "{'text':'Single quotes'}",
      expected: '', // Changed
    },

    // 6. Strings that look like JSON but aren't or are ambiguous
    {
      description: 'Ambiguous JSON: Empty object',
      input: '{}',
      expected: '', // Changed
    },
    {
      description: 'Ambiguous JSON: Empty array',
      input: '[]',
      expected: '', // Changed
    },
    {
      description: 'Ambiguous JSON: Invalid structure',
      input: '{key: value}',
      expected: '', // Changed
    },
    {
      description: 'Not JSON: Braces in sentence',
      input: 'This is {not json} but has braces.',
      expected: 'This is {not json} but has braces.',
    },

    // 7. Markdown JSON code blocks
    {
      description: "Markdown JSON: Simple 'text'",
      input: '```json\n{"text":"From markdown"}\n```',
      expected: 'From markdown',
    },
    {
      description: "Markdown JSON: Spaced 'message'",
      input: '```json\n{\n  "message": "Spaced markdown JSON"\n}\n```',
      expected: 'Spaced markdown JSON',
    },
    {
      description: "Markdown JSON: 'content' with other key",
      input:
        '```json\n{"other_key":"value", "content": "Markdown content"}\n```',
      expected: 'Markdown content',
    },
    {
      description: "Markdown JSON: Uncommon key 'data'",
      input: '```json\n{"data":"Markdown data"}\n```',
      expected: '', // Changed
    },
    {
      description: 'Markdown JSON: Malformed content',
      input: '```json\nMalformed JSON\n```',
      expected: '', // Changed
    },
    {
      description:
        'Markdown JSON: Embedded in text and no common key in JSON (should return original text)',
      input:
        'Some text before ```json\n{"other_key":"Embedded"}\n``` and after.',
      expected:
        'Some text before ```json\n{"other_key":"Embedded"}\n``` and after.',
    },

    // 8. Stringified JSON (JSON within a JSON string)
    {
      description: "Stringified JSON: 'text' key",
      input: '"{\\"text\\":\\"Hello from stringified JSON\\"}"',
      expected: 'Hello from stringified JSON',
    },
    {
      description: "Stringified JSON: 'message' key with action",
      input:
        '"{\\"message\\":\\"Another stringified\\", \\"action\\":\\"CONTINUE\\"}"',
      expected: 'Another stringified',
    },
    {
      description: "Stringified JSON: Uncommon key 'data'",
      input: '"{\\"data\\":\\"Stringified data, no common key\\"}"',
      expected: '', // Changed
    },
    {
      description: 'Stringified JSON: Normal string in quotes',
      input: '"Just a normal string in quotes"',
      expected: 'Just a normal string in quotes',
    },
    // 9. Empty strings and whitespace
    { description: 'Empty string', input: '', expected: '' },
    { description: 'Whitespace string', input: '   ', expected: '' },

    // 10. Strings with escaped characters (within the text value)
    {
      description: 'Escaped chars: Quote and newline',
      input: '{"text":"This has a \\"quote\\" and a \\nnewline."}',
      expected: 'This has a "quote" and a \nnewline.',
    },
    {
      description: 'Escaped chars: Backslashes',
      input: '{"message":"Path: C:\\\\Users\\\\Name"}',
      expected: 'Path: C:\\Users\\Name',
    },

    // 11. Non-string inputs
    { description: 'Non-string: null', input: null, expected: 'null' },
    {
      description: 'Non-string: undefined',
      input: undefined,
      expected: 'undefined',
    },
    { description: 'Non-string: number', input: 123, expected: '123' },
    { description: 'Non-string: boolean', input: true, expected: 'true' },

    // 12. Regex extraction cases (where direct JSON.parse fails but pattern exists)
    {
      description:
        'Regex: Embedded JSON-like pattern (should pass through if not sole/end content)',
      input:
        'Some leading text {"text":"Regex should find this"} and trailing text.',
      expected:
        'Some leading text {"text":"Regex should find this"} and trailing text.',
    },
    {
      description: 'Regex: Valid JSON (should be caught by direct parse)',
      input: '{"text":"Value for text", "unrelated":"data"}',
      expected: 'Value for text',
    },
    {
      description: 'Regex: Escaped quotes in message',
      input: '{"message": "A message with \\"escaped quotes\\" inside."}',
      expected: 'A message with "escaped quotes" inside.',
    },
    {
      description:
        'Regex: Slightly malformed with text key (should be extracted by Layer 5)',
      input:
        '{ "text" : "This is almost JSON, but has a syntax error like a missing comma somewhere" "other": "value" }',
      // This specific input might be hard for the regex if "text" isn't >50% of string.
      // Adjusting expectation based on current regex logic for Layer 5.
      // If it's not caught by Layer 5, it might pass through or become empty due to malformation.
      // Given the "text" is a large part, it should extract.
      expected:
        'This is almost JSON, but has a syntax error like a missing comma somewhere',
    },

    // 13. Cases where text might be a valid JSON string itself
    {
      description: 'JSON string value',
      input: '"Hello from a JSON string"',
      expected: 'Hello from a JSON string',
    },

    // 14. More complex nested or mixed content
    {
      description: 'Complex JSON: Nested text',
      input: '{"data": {"text": "Nested text"}}',
      expected: '', // Changed (no common key at top level)
    },
    {
      description: 'Complex JSON: Array of objects',
      input: '[{"text":"Item 1"}, {"text":"Item 2"}]',
      expected: '', // Changed (array is not an object with common keys)
    },

    {
      description: 'Stringified JSON edge: Malformed inner',
      input: '"malformed stringified json: {text: no quotes}"',
      expected: 'malformed stringified json: {text: no quotes}',
    },

    // 16. Edge cases for markdown JSON
    {
      description: 'Markdown JSON edge: String value',
      input: '```json\n"just a string in markdown json"\n```',
      expected: 'just a string in markdown json',
    },
    {
      description: 'Markdown JSON edge: Number value',
      input: '```json\n123\n```',
      expected: '123',
    },

    // 17. Text that happens to contain JSON-like substrings but is not JSON itself.
    {
      description: 'JSON-like substring: User query',
      input:
        'The user\'s query was: {"input":"search for cats"}. Please respond.',
      expected:
        'The user\'s query was: {"input":"search for cats"}. Please respond.',
    },
    {
      description:
        'JSON-like substring: Thought and JSON (extracts from last JSON if conditions met)',
      input:
        'Action: NONE, Thought: The user is asking for a simple greeting. I should respond politely. {"text":"Hello there! How can I help you today?"}',
      expected: 'Hello there! How can I help you today?',
    },
    {
      description:
        'JSON-like substring: Multiple JSON objects (extracts from last JSON if conditions met)',
      input:
        '{"action":"THINK", "text":"I am thinking..."}\nOkay, I have a response: {"text":"Here is your answer!"}',
      expected: 'Here is your answer!',
    },
    {
      description:
        'JSON-like substring: Part of sentence (not at end, no short prefix)',
      input:
        'This is a sentence. {"text":"This is a JSON object that is part of a sentence."}',
      expected:
        'This is a sentence. {"text":"This is a JSON object that is part of a sentence."}',
    },
    {
      description: 'JSON-like substring: Thought with markdown JSON',
      input:
        'Thought: This is a thought.```json\n{"text":"Actual response"}\n```',
      expected: 'Actual response',
    },

    // 18. Input that is a JSON string of a non-object (parsed by Layer 2 if it's a stringified primitive)
    {
      description: 'JSON string non-object: true',
      input: '"true"', // This is a string "true", not boolean true
      expected: 'true',
    },
    {
      description: 'JSON string non-object: null',
      input: '"null"', // This is a string "null", not null
      expected: 'null',
    },
    {
      description: 'JSON string non-object: number',
      input: '"123.45"', // This is a string "123.45", not number 123.45
      expected: '123.45',
    },

    // 19. Test for very minimal JSON-like strings
    {
      description: 'Minimal JSON-like: Invalid',
      input: '{:}',
      expected: '', // Changed
    },
    {
      description: 'Minimal JSON-like: Invalid keys',
      input: '{a:b}',
      expected: '', // Changed
    },
    {
      description: 'Minimal JSON-like: Embedded in text',
      input: 'Text with {key: value} inside.',
      expected: 'Text with {key: value} inside.',
    },

    // 20. Test specifically for the example provided by the user
    {
      description: 'User example: Full JSON object',
      input:
        '{"text":"Hello! I\'m Trusty Sparks, your cheerful robot guide for Trust Wallet. I’m designed to help make your crypto journey simple and secure. With my bright, friendly demeanor, I\'m here to assist you with wallet setup, managing your assets, and navigating the world of decentralized applications. What can I do for you today?","action":"NONE"}',
      expected:
        "Hello! I'm Trusty Sparks, your cheerful robot guide for Trust Wallet. I’m designed to help make your crypto journey simple and secure. With my bright, friendly demeanor, I'm here to assist you with wallet setup, managing your assets, and navigating the world of decentralized applications. What can I do for you today?",
    },
    {
      description: 'User example: Full JSON object with newlines',
      input:
        '\n{"text":"Hello! I\'m Trusty Sparks, your cheerful robot guide for Trust Wallet. I’m designed to help make your crypto journey simple and secure. With my bright, friendly demeanor, I\'m here to assist you with wallet setup, managing your assets, and navigating the world of decentralized applications. What can I do for you today?","action":"NONE"}\n',
      expected:
        "Hello! I'm Trusty Sparks, your cheerful robot guide for Trust Wallet. I’m designed to help make your crypto journey simple and secure. With my bright, friendly demeanor, I'm here to assist you with wallet setup, managing your assets, and navigating the world of decentralized applications. What can I do for you today?",
    },
    // 21. Test for LLM responses that might have text outside a JSON block but the JSON is the intended parsable output.
    {
      description:
        'LLM response with leading text and markdown JSON (extract from markdown)',
      input:
        'Okay, here is the response in JSON format:\n```json\n{\n  "text": "This is the extracted text from a markdown block.",\n  "confidence": 0.95\n}\n```',
      expected: 'This is the extracted text from a markdown block.',
    },
    {
      description:
        'LLM response with thought and markdown JSON (extract from markdown)',
      input:
        'Thought: The user wants a simple greeting.\n```json\n{\n  "message": "Hello there!",\n  "action": "NONE"\n}\n```',
      expected: 'Hello there!',
    },
    // 22. Test for cases where the regex might be too greedy or not greedy enough
    {
      description:
        'Regex: JSON-like pattern within a sentence (should pass through)',
      input:
        'The result is {"text":"success"}, but also note that other factors apply.',
      expected:
        'The result is {"text":"success"}, but also note that other factors apply.',
    },
    {
      description: 'Regex: Pure JSON object (handled by Layer 1)',
      input: '{"text":"A short message."}',
      expected: 'A short message.',
    },
    // 23. Test for escaped newlines and quotes within the text value of a JSON string
    {
      description: 'Escaped chars: Newlines and quotes in JSON value',
      input:
        '{"text":"This is a line.\\nThis is another line with a \\"quote\\"."}',
      expected: 'This is a line.\nThis is another line with a "quote".',
    },
  ];

  testCases.forEach((tc) => {
    it(tc.description || '', () => {
      expect(PreventJsonLeaking(tc.input)).toBe(tc.expected);
    });
  });
});
