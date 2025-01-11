/**
 * Parse a Discord message of a string and convert it to relevant HTML markup
 * 
 * Use a real parser for this, not just a regex
 * 
 * Goals:
 * - Migrate all images based off of the following:
 * @example <:shrugging:519267805871341568> becomes <img src="https://cdn.discordapp.com/emojis/519267805871341568.png" alt="shrugging">
 * @example <a:dancing_penguin:1013090009756209234> becomes <img src="https://cdn.discordapp.com/emojis/1013090009756209234.gif" alt="dancing_penguin">
 * - Migrate all mentions to a username based off of the following:
 * @example <@270063754576789504> becomes "@crutchcorn (Corbin Crutchley)"
 * - Migrate all mentions of a role to a role name based off of:
 * @example <@&910945073624129607> becomes "@modbots"
 * - Inline code samples should be wrapped in <code> tags
 * @example `let x = 5;` becomes <code>let x = 5;</code>
 * - Code blocks should be wrapped in <pre> tags
 * @example
 *     ```js
 *     let x = 5;
 *     ```
 *     becomes
 *     <pre><code>let x = 5;</code></pre>
 * - Migrate all mentions of a channel to a token based off the following:
 * @example <#908771693156257802> becomes <a href="/channels/908771693156257802">#memes</a>
 * - Handle Discord relative timestamps
 * @example <t:1630368000:R> becomes "2 days ago" and <t:1630368000:F> becomes "09/30/2021"
 * - Handle markdown-style headings up to level 3:
 * @example # Heading 1 becomes <h1>Heading 1</h1>
 * - All other text should be left as is, but escaped to prevent XSS
 */

export type TokenText = { type: 'text'; content: string };
export type TokenEmoji = { 
  type: 'emoji'; 
  name: string; 
  id: string;
  animated?: boolean;
};
export type TokenMention = { type: 'mention'; id: string };
export type TokenCodeInline = { type: 'codeInline'; content: string };
export type TokenCodeBlock = { 
  type: 'codeBlock'; 
  content: string;
  lang?: string;
};
export type TokenChannel = { type: 'channel'; id: string };
export type TokenTimestamp = { 
  type: 'timestamp'; 
  timestamp: number;
  format: string;
};
export type TokenRoleMention = { type: 'roleMention'; id: string };
export type TokenHeader = {
  type: 'header';
  content: string;
  level: 1 | 2 | 3;
};

export type Token = 
  | TokenText
  | TokenEmoji
  | TokenMention
  | TokenCodeInline
  | TokenCodeBlock
  | TokenChannel
  | TokenTimestamp
  | TokenRoleMention
  | TokenHeader

type TokenParseResult = {
  token: Token;
  advanceBy: number;
};

function isSnowflake(input: string): boolean {
  return /^\d+$/.test(input);
}

function parseChannel(input: string, startIndex: number): TokenParseResult | null {
  if (input[startIndex] !== '<' || input[startIndex + 1] !== '#') return null;
  
  let current = startIndex + 2;
  let channelId = '';
  
  while (current < input.length && input[current] !== '>') {
    channelId += input[current];
    current++;
  }
  
  if (!isSnowflake(channelId)) return null;
  
  return {
    token: { type: 'channel', id: channelId },
    advanceBy: current - startIndex + 1
  };
}

function parseEmoji(input: string, startIndex: number): TokenParseResult | null {
  if (input[startIndex] !== '<') return null;
  if (input[startIndex + 1] !== ':' && (input[startIndex + 1] !== 'a' || input[startIndex + 2] !== ':')) return null;

  const isAnimated = input[startIndex + 1] === 'a';
  let current = startIndex + (isAnimated ? 3 : 2);
  let emojiName = '';
  
  while (current < input.length && input[current] !== ':') {
    emojiName += input[current];
    current++;
  }
  
  current++;
  let emojiId = '';
  
  while (current < input.length && input[current] !== '>') {
    emojiId += input[current];
    current++;
  }

  if (!isSnowflake(emojiId)) return null;
  
  return {
    token: { 
      type: 'emoji', 
      name: emojiName, 
      id: emojiId,
      ...(isAnimated ? { animated: true } : {})
    },
    advanceBy: current - startIndex + 1
  };
}

function parseMention(input: string, startIndex: number): TokenParseResult | null {
  if (input[startIndex] !== '<' || input[startIndex + 1] !== '@') return null;
  
  let current = startIndex + 2;
  let mentionId = '';
  
  while (current < input.length && input[current] !== '>') {
    mentionId += input[current];
    current++;
  }

  if (!isSnowflake(mentionId)) return null;
  
  return {
    token: { type: 'mention', id: mentionId },
    advanceBy: current - startIndex + 1
  };
}

function parseRoleMention(input: string, startIndex: number): TokenParseResult | null {
  if (input[startIndex] !== '<' || input[startIndex + 1] !== '@' || input[startIndex + 2] !== '&') return null;
  
  let current = startIndex + 3;
  let roleId = '';
  
  while (current < input.length && input[current] !== '>') {
    roleId += input[current];
    current++;
  }
  
  if (!isSnowflake(roleId)) return null;

  return {
    token: { type: 'roleMention', id: roleId },
    advanceBy: current - startIndex + 1
  };
}

function parseCodeBlock(input: string, startIndex: number): TokenParseResult | null {
  if (input.slice(startIndex, startIndex + 3) !== '```') return null;
  
  let current = startIndex + 3;
  let firstLine = '';
  while (current < input.length && input[current] !== '\n' && input.slice(current, current + 3) !== '```') {
    firstLine += input[current];
    current++;
  }

  if (input[current] === '\n') current++;
  
  let content = '';
  while (current < input.length && input.slice(current, current + 3) !== '```') {
    content += input[current];
    current++;
  }

  const token: TokenCodeBlock = { type: 'codeBlock', content: content.replace(/\n$/, '') };
  if (firstLine && !firstLine.trim().includes(' ')) {
    token.lang = firstLine;
  } else if (firstLine) {
    token.content = firstLine + '\n' + token.content;
  }

  return {
    token,
    advanceBy: current - startIndex + 3
  };
}

function parseInlineCode(input: string, startIndex: number): TokenParseResult | null {
  if (input[startIndex] !== '`') return null;
  
  let current = startIndex + 1;
  let content = '';
  
  while (current < input.length && input[current] !== '`') {
    content += input[current];
    current++;
  }
  
  return {
    token: { type: 'codeInline', content },
    advanceBy: current - startIndex + 1
  };
}

function parseTimestamp(input: string, startIndex: number): TokenParseResult | null {
  if (input[startIndex] !== '<' || input[startIndex + 1] !== 't' || input[startIndex + 2] !== ':') return null;
  
  let current = startIndex + 3;
  let timestamp = '';
  
  while (current < input.length && input[current] !== ':') {
    timestamp += input[current];
    current++;
  }
  
  // Skip ':'
  current++;
  let format = '';
  
  while (current < input.length && input[current] !== '>') {
    format += input[current];
    current++;
  }
  
  return {
    token: { 
      type: 'timestamp', 
      timestamp: parseInt(timestamp, 10),
      format
    },
    advanceBy: current - startIndex + 1
  };
}

function parseHeader(input: string, startIndex: number): TokenParseResult | null {
  // Only parse at start of line or start of input
  if (startIndex > 0 && input[startIndex - 1] !== '\n') return null;

  let level = 0;
  let current = startIndex;

  // Count # symbols
  while (current < input.length && input[current] === '#' && level < 4) {
    level++;
    current++;
  }

  // Only handle levels 1-3
  if (level === 0 || level > 3) return null;

  // Must have a space after #
  if (input[current] !== ' ') return null;
  current++;

  let content = '';
  // Capture until newline or end of input
  while (current < input.length && input[current] !== '\n') {
    content += input[current];
    current++;
  }

  return {
    token: {
      type: 'header',
      content: content.trim(),
      level: level as 1 | 2 | 3
    },
    advanceBy: current - startIndex
  };
}

export function tokenizeMessage(input: string): Token[] {
  const tokens: Token[] = [];
  let current = 0;
  let textBuffer = '';

  function pushTextBuffer() {
    if (textBuffer) {
      tokens.push({ type: 'text', content: textBuffer });
      textBuffer = '';
    }
  }

  const parsers = [parseHeader, parseChannel, parseEmoji, parseRoleMention, parseMention, parseCodeBlock, parseInlineCode, parseTimestamp];

  while (current < input.length) {
    let parsed = false;
    
    for (const parser of parsers) {
      const result = parser(input, current);
      if (result) {
        pushTextBuffer();
        tokens.push(result.token);
        current += result.advanceBy;
        parsed = true;
        break;
      }
    }

    if (!parsed) {
      textBuffer += input[current];
      current++;
    }
  }

  pushTextBuffer();
  return tokens;
}