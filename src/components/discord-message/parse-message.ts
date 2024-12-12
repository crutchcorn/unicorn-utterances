/**
 * Parse a Discord message of a string and convert it to relevant HTML markup
 * 
 * Use a real parser for this, not just a regex
 * 
 * Goals:
 * - Migrate all images based off of the following:
 * @example <:shrugging:519267805871341568> becomes <img src="https://cdn.discordapp.com/emojis/519267805871341568.png" alt="shrugging">
 * - Migrate all mentions to a username based off of the following:
 * @example <@270063754576789504> becomes "@crutchcorn (Corbin Crutchley)"
 * - All other text should be left as is, but escaped to prevent XSS
 */

type Token = 
  | { type: 'text'; content: string }
  | { type: 'emoji'; name: string; id: string }
  | { type: 'mention'; id: string };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let current = 0;
  let buffer = '';

  function pushBuffer() {
    if (buffer) {
      tokens.push({ type: 'text', content: buffer });
      buffer = '';
    }
  }

  while (current < input.length) {
    const char = input[current];

    if (char === '<' && input[current + 1] === ':') {
      pushBuffer();
      
      // Skip '<:'
      current += 2;
      let emojiName = '';
      
      // Read until ':'
      while (current < input.length && input[current] !== ':') {
        emojiName += input[current];
        current++;
      }
      
      // Skip ':'
      current++;
      let emojiId = '';
      
      // Read until '>'
      while (current < input.length && input[current] !== '>') {
        emojiId += input[current];
        current++;
      }
      
      // Skip '>'
      current++;
      tokens.push({ type: 'emoji', name: emojiName, id: emojiId });
    } else if (char === '<' && input[current + 1] === '@') {
      pushBuffer();
      
      // Skip '<@'
      current += 2;
      let mentionId = '';
      
      // Read until '>'
      while (current < input.length && input[current] !== '>') {
        mentionId += input[current];
        current++;
      }
      
      // Skip '>'
      current++;
      tokens.push({ type: 'mention', id: mentionId });
    } else {
      buffer += char;
      current++;
    }
  }

  pushBuffer();
  return tokens;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface ParseDiscordMessageOptions {
  lookupUserName: (id: string) => Promise<string>;
}

export async function parseDiscordMessage(message: string, {
  lookupUserName
}: ParseDiscordMessageOptions): Promise<string> {
  const tokens = tokenize(message);
  return (await Promise.all(tokens.map(async token => {
    if (token.type === 'text') {
      return escapeHtml(token.content);
    }
    if (token.type === 'mention') {
      const username = await lookupUserName(token.id);
      return `@${username}`;
    }
    return `<img src="https://cdn.discordapp.com/emojis/${token.id}.png" alt="${token.name}">`;
  }))).join('');
}
