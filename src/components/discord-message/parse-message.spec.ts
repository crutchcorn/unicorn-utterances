import { describe, it, expect } from 'vitest';
import { tokenizeMessage, Token } from './parse-message';

describe('tokenizeMessage', () => {
  it('should handle plain text', () => {
    const input = 'Hello, world!';
    const expected: Token[] = [{ type: 'text', content: 'Hello, world!' }];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should parse Discord emoji', () => {
    const input = '<:shrugging:519267805871341568>';
    const expected: Token[] = [{ type: 'emoji', name: 'shrugging', id: '519267805871341568' }];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should parse not parse Discord emoji when non-numbers are used', () => {
    const input = '<:shrugging:asdf>';
    const expected: Token[] = [{ type: 'text', content: '<:shrugging:asdf>' }];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should parse animated Discord emoji', () => {
    const input = '<a:dancing_penguin:1013090009756209234>';
    const expected: Token[] = [{
      type: 'emoji',
      name: 'dancing_penguin',
      id: '1013090009756209234',
      animated: true
    }];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should parse not parse animated Discord emoji when non-numbers are used', () => {
    const input = '<a:dancing_penguin:asdf>';
    const expected: Token[] = [{ type: 'text', content: '<a:dancing_penguin:asdf>' }];
    expect(tokenizeMessage(input)).toEqual(expected);
  });


  it('should handle mixed animated and static emojis', () => {
    const input = '<a:dancing:123> text <:static:456>';
    const expected: Token[] = [
      { type: 'emoji', name: 'dancing', id: '123', animated: true },
      { type: 'text', content: ' text ' },
      { type: 'emoji', name: 'static', id: '456' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle mixed text and emoji', () => {
    const input = 'Hello <:shrugging:519267805871341568> world';
    const expected: Token[] = [
      { type: 'text', content: 'Hello ' },
      { type: 'emoji', name: 'shrugging', id: '519267805871341568' },
      { type: 'text', content: ' world' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should escape HTML in text content', () => {
    const input = 'Hello <script>alert("xss")</script>';
    const expected: Token[] = [{ type: 'text', content: 'Hello <script>alert("xss")</script>' }];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle multiple emojis', () => {
    const input = '<:emoji1:123> text <:emoji2:456>';
    const expected: Token[] = [
      { type: 'emoji', name: 'emoji1', id: '123' },
      { type: 'text', content: ' text ' },
      { type: 'emoji', name: 'emoji2', id: '456' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should parse Discord mentions', () => {
    const input = '<@270063754576789504>';
    const expected: Token[] = [{ type: 'mention', id: '270063754576789504' }];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should not parse Discord mentions when a non-number makes it in', () => {
    const input = '<@asdf>';
    const expected: Token[] = [{ type: 'text', content: '<@asdf>' }];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle mixed text and mentions', () => {
    const input = 'Hello <@270063754576789504> world';
    const expected: Token[] = [
      { type: 'text', content: 'Hello ' },
      { type: 'mention', id: '270063754576789504' },
      { type: 'text', content: ' world' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle mixed text, emoji, and mentions', () => {
    const input = 'Hello <:shrugging:519267805871341568> <@270063754576789504> world';
    const expected: Token[] = [
      { type: 'text', content: 'Hello ' },
      { type: 'emoji', name: 'shrugging', id: '519267805871341568' },
      { type: 'text', content: ' ' },
      { type: 'mention', id: '270063754576789504' },
      { type: 'text', content: ' world' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should parse inline code samples', () => {
    const input = 'This is `inline code` example';
    const expected: Token[] = [
      { type: 'text', content: 'This is ' },
      { type: 'codeInline', content: 'inline code' },
      { type: 'text', content: ' example' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should parse code blocks', () => {
    const input = 'Here is a code block:\n```js\nlet x = 5;\n```';
    const expected: Token[] = [
      { type: 'text', content: 'Here is a code block:\n' },
      { type: 'codeBlock', content: 'let x = 5;', lang: "js" }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle mixed text, inline code, and code blocks', () => {
    const input = 'Text `inline code` more text\n```js\nlet x = 5;\n``` end';
    const expected: Token[] = [
      { type: 'text', content: 'Text ' },
      { type: 'codeInline', content: 'inline code' },
      { type: 'text', content: ' more text\n' },
      { type: 'codeBlock', content: 'let x = 5;', lang: 'js' },
      { type: 'text', content: ' end' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle code blocks with language', () => {
    const input = '```js\nconsole.log(123)\n```';
    const expected: Token[] = [
      { type: 'codeBlock', content: 'console.log(123)', lang: 'js' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should preserve first line when it contains spaces or curly braces', () => {
    const input = '```js {1}\nconsole.log(123)\n```';
    const expected: Token[] = [
      { type: 'codeBlock', content: 'js {1}\nconsole.log(123)' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle code blocks without language', () => {
    const input = '```\nconsole.log(123)\n```';
    const expected: Token[] = [
      { type: 'codeBlock', content: 'console.log(123)' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle code blocks with no trailing newline', () => {
    const input = '```\none\n```';
    const expected: Token[] = [
      { type: 'codeBlock', content: 'one' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle code blocks with language and no trailing newline', () => {
    const input = '```js\none\n```';
    const expected: Token[] = [
      { type: 'codeBlock', content: 'one', lang: 'js' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should parse Discord channel mentions', () => {
    const input = '<#908771693156257802>';
    const expected: Token[] = [{ type: 'channel', id: '908771693156257802' }];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle mixed text and channel mentions', () => {
    const input = 'Check out <#908771693156257802> for memes';
    const expected: Token[] = [
      { type: 'text', content: 'Check out ' },
      { type: 'channel', id: '908771693156257802' },
      { type: 'text', content: ' for memes' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle mixed mentions, channels, and emojis', () => {
    const input = 'Hey <@270063754576789504>, check <#908771693156257802> <:smile:123>';
    const expected: Token[] = [
      { type: 'text', content: 'Hey ' },
      { type: 'mention', id: '270063754576789504' },
      { type: 'text', content: ', check ' },
      { type: 'channel', id: '908771693156257802' },
      { type: 'text', content: ' ' },
      { type: 'emoji', name: 'smile', id: '123' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should parse Discord timestamps', () => {
    const input = '<t:1630368000:R>';
    const expected: Token[] = [{
      type: 'timestamp',
      timestamp: 1630368000,
      format: 'R'
    }];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle mixed text and timestamps', () => {
    const input = 'Posted <t:1630368000:F> | Updated <t:1630468000:R>';
    const expected: Token[] = [
      { type: 'text', content: 'Posted ' },
      { type: 'timestamp', timestamp: 1630368000, format: 'F' },
      { type: 'text', content: ' | Updated ' },
      { type: 'timestamp', timestamp: 1630468000, format: 'R' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle timestamps with different formats', () => {
    const formats = ['t', 'T', 'd', 'D', 'f', 'F', 'R'];
    for (const format of formats) {
      const input = `<t:1630368000:${format}>`;
      const expected: Token[] = [{
        type: 'timestamp',
        timestamp: 1630368000,
        format
      }];
      expect(tokenizeMessage(input)).toEqual(expected);
    }
  });

  it('should parse Discord role mentions', () => {
    const input = '<@&910945073624129607>';
    const expected: Token[] = [{ type: 'roleMention', id: '910945073624129607' }];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle mixed text and role mentions', () => {
    const input = 'Hello <@&910945073624129607> everyone';
    const expected: Token[] = [
      { type: 'text', content: 'Hello ' },
      { type: 'roleMention', id: '910945073624129607' },
      { type: 'text', content: ' everyone' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle mixed user mentions and role mentions', () => {
    const input = 'Hey <@270063754576789504>, you have <@&910945073624129607> role';
    const expected: Token[] = [
      { type: 'text', content: 'Hey ' },
      { type: 'mention', id: '270063754576789504' },
      { type: 'text', content: ', you have ' },
      { type: 'roleMention', id: '910945073624129607' },
      { type: 'text', content: ' role' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  });

  it('should handle markdown header', () => {
    const input = '# Header';
    const expected: Token[] = [
      { type: 'header', content: 'Header', level: 1 }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  })

  it('should handle markdown headers', () => {
    const input = '# Header\n## Subheader\n### Subsubheader';
    const expected: Token[] = [
      { type: 'header', content: 'Header', level: 1 },
      { type: "text", content: "\n" },
      { type: 'header', content: 'Subheader', level: 2 },
      { type: "text", content: "\n" },
      { type: 'header', content: 'Subsubheader', level: 3 }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  })

  // Just the way Discord does it ¯\_(ツ)_/¯
  it("Should not handle heading levels beyond 3", () => {
    const input = '#### Beyond';
    const expected: Token[] = [
      { type: 'text', content: '#### Beyond' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  })

  it("Should not convert all hashes to headings when not at the start", () => {
    const input = 'asdf #below';
    const expected: Token[] = [
      { type: 'text', content: 'asdf #below' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  })

  it("Should not convert channel names unless they're all numbers", () => {
    const input = '<#below>';
    const expected: Token[] = [
      { type: 'text', content: '<#below>' }
    ];
    expect(tokenizeMessage(input)).toEqual(expected);
  })
});
