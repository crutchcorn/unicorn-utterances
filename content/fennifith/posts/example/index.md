---
{
	title: "Example Post",
	description: "Look at all those edge cases!",
	published: '1999-09-18',
	tags: [],
	license: 'cc-by-nc-sa-4',
	noindex: true
}
---

This is regular text.

# Single-level list

- List without a nested `<p>` tag
- List item 2
- List item 3

# Single-level ordered list

1. List without a nested `<p>` tag
2. List item 2
3. List item 3

# Single-level padded list

- List item 1

- List item 2

- List item 3

- Extended content

  This list item has multiple paragraphs with a lot of content.

  ## This is a heading!

  Hello.

- ## List item 5
  Hi

# Single-level padded ordered list

1. List item 1

2. List item 2

3. List item 3

4. Extended content

   This list item has multiple paragraphs with a lot of content.

   ## This is a heading!

   Hello.

5. ## List item 5
   Hi

# Single-level list with headings

- # List item 1
- ## List item 2
- ### List item 3

# Single-level ordered list with headings

1. # List item 1
2. ## List item 2
3. ### List item 3

# Single-level list with blocks

- ```js
  console.log("Hello world!");
  ```

- List item 2
  <details>
    <summary>What's this?</summary>
	OwO
  </details>

- <iframe src="https://stackblitz.com/edit/angular-unicorns-text-input?embed=1&file=src/app/app.component.ts" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
  List item 3

- List item 4

# Single-level ordered list with blocks

1. ```js
   console.log("Hello world!");
   ```

2. List item 2
   <details>
     <summary>What's this?</summary>
	 OwO
   </details>

3. <iframe src="https://stackblitz.com/edit/angular-unicorns-text-input?embed=1&file=src/app/app.component.ts" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
   List item 3

4. List item 4

# Nested list

- List item 1
  - Sub-item 1
  - Sub-item 2
- List item 2
- List item 3

# Nested ordered list

1. List item 1
   1. Sub-item 1
   2. Sub-item 2
2. List item 2
3. List item 3

# Nested list in padded list

- List item 1

  - Sub-item 1
  - Sub-item 2

- List item 2

  - Padded sub-item 1

  - Padded sub-item 2

- List item 3

# Nested ordered list in padded ordered list

1. List item 1

   1. Sub-item 1
   2. Sub-item 2

2. List item 2

   1. Padded sub-item 1

   2. Padded sub-item 2

3. List item 3

# Heading `with a code snippet` inside of it

# Heading [with a link](https://example.com) inside of it

# Quiz Components

<!-- ::start:quiz-radio -->
## Based on what you’ve seen: Why does JS? {#why-does-js}
- ( ) Option 1 {#1}
- (x) Option 2 {#2}
- ( ) Option 3 {#3}
- ( ) Option 4 {#4}
<!-- ::end:quiz-radio -->
