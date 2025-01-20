---
{
  title: "Web Fundamentals: Manipulating the DOM with JavaScript",
  description: "The ninth chapter of this series finally goes over the DOM, how to manipulate it, and how to make our components interactive!",
  published: "2024-11-13T20:08:26.988Z",
  tags: ["css", "html", "design"],
  license: "cc-by-4",
  authors: ["obibaratt", "edpratti"],
  order: 9
}

---

The DOM represents the structure of a webpage, enabling developers to modify content, styles, and elements in real time. In this article, we will explore the fundamentals of DOM manipulation, providing you with essential techniques and examples to enhance your web development projects.

# What we'll learn in this article

- **Manipulating DOM elements**
  - Creating elements
  - Selecting elements
  - Adding and removing `styles`, `class`es & content
  - Listening to events
- **Data loading**

---

# The `document`

The `document` is how you interact with the DOM and everything that is loaded within it. We use the `document.` prefix to manipulate all elements that compose the webpage we're looking at.

> **Understanding the DOM:**
> If you haven't read the previous chapter, this is the time to do so. We're going to dive straight into how to manipulate the DOM, but it's important to understand the context behind how content is displayed by the browser.
>
> 📝 **[Click here to read the article](/posts/understanding-the-dom)**

# Creating elements

We can create HTML elements using the `createElement('tag')` method. Let's create a new paragraph, specified by the `<p>` tag.

```js
const newParagraph = document.createElement('p');

/* Modify the content with the textContent suffix */
newParagraph.textContent = "This is a new paragraph.";
```

But this simply stores a new element within the `const` we created. For us to display content, we must append an element to the document.

Let's append our new paragraph to the `<body>` tag.

```js
const newParagraph = document.createElement('p');

/* Modify the content with the textContent suffix */
newParagraph.textContent = "This is a new paragraph.";

/* Apply the appendChild method to the document.body. */
document.body.appendChild(newParagraph);
```

If we were to look at our document, we would now see our paragraph as part of the body.

<iframe data-frame-title="Creating elements" src="pfp-code:./creating-elements?template=node&embed=1&file=src%2Fscript.js"></iframe>

We can use `createElement('tag')` to create any tag supported by HTML. In our first chapter - HTML - we go over semantic elements. Make sure to recap!

---

# Selecting elements

In our demo above, we're already making use of the selecting methods of JavaScript do make our demo interactive. But here's a list of the ways we can get elements from the DOM.

| Method | JavaScript | Returns |
| --- | --- | --- |
| Select by `id` | `document.getElementById("myElement")` | A unique HTMLElement |
| Select by `class` | `document.getElementsByClassName("myClass")` | HTMLCollection (Live) |
| Select by `<tag>` | `document.querySelectAll("p")` | NodeList (Static) |

---

# Manipulating elements

Now that we understand how to select elements and bind them to variables, we can start manipulating them in any way we want. 

We're now going to use everything we've learned in Web Fundamentals — variables, styles, classes, inheritance, and apply them all through JavaScript!

## Adding and removing styles

CSS properties are called `styles`, and we can access them through JavaScript.

In CSS, properties are shown as such:

```css
body {
  background-color: lightblue;
}
```

When accessing properties in JavaScript, we use a different syntax, in camel-case.

Using the `document`, we can access and apply any styles we want.

```js
document.body.style.backgroundColor = "lightblue";
```

There are some limitations, however. In JavaScript, unlike CSS, there are no shorthands. Let's take `padding`, for example.

```css
body {
  padding: 24px 48px;
  /* [padding-top & padding-bottom], [padding-left & padding-right] */
}
```

In JavaScript, however, we cannot apply those properties at once. In JavaScript, we would need to do each individually.

```js
document.body.style.paddingTop = "24px";
document.body.style.paddingBottom = "24px";
document.body.style.paddingLeft = "48px";
document.body.style.paddingRight = "48px";
```

---

## Adding and removing classes

In HTML, we can apply as many classes to an element as we'd like.

```html
<button class="btn-emphasized btn-large btn-icon">Button label</button>
```

In CSS, these are declared as separate classes.

```css
.btn-emphasized { };
.btn-large { };
.btn-icon { };
```

In JavaScript, we can access an element's classes with the `.classList` suffix.

We can **add a class** with the following command.

```js
const element = document.getElementById("#element");

element.classList.add("myClass");
```

We can **remove a class** with the following command:

```js
const element = document.getElementById("#element");

element.classList.remove("myClass");
```

We can also **toggle a class** using `.toggle`.

```js
const element = document.getElementById("#element");

element.classList.toggle("myClass");
```

In the following demo, we're toggling two classes on a card: `.small` and `.no-image`. We're also performing style changes when both are applied!

```css
/* Causes the card to shrink in size */
.small {
  width: 240px;
}

/* When applied, hides the #illustration */
.no-image > #illustration {
  display: none;
}

/* When the card is small and the illustration is hidden,
change the corner radius to be smaller, so as to not clip the text. */
.pfp-card.small.no-image {
  border-radius: 24px;
}
```

<iframe data-frame-title="Toggling classes" src="pfp-code:./toggling-classes?template=node&embed=1&file=src%2Fscript.js" height="800"></iframe>

---

## Adding and removing events

In all of our demos in this series, we've been attaching events to elements to make them interactive. Now we're going to formally talk about them.

To add an event, we must attach it to an element, using `addEventListener(type, listener)`.

```js
/* Declare our target */
const toggleButton = document.getElementById("myButton");

/* Attach an event */
toggleButton.addEventListener('click', myFunction);

function myFunction() = { ... };
```

In the example above, our `addEventListener()` is detecting an interaction type of `'click'`, and when triggered, executes the `myFunction` function.

### Event types

Not all events are created equal. Not only can specific elements trigger specific events, but so can different interaction sources.


| Common sources | Event type |
| --- | --- |
| Mouse | <ul><li>`click`: A single click.</li><li>`dbclick`: A double click.</li><li>`mousedown`: When pressing down on a mouse's left button.</li><li>`mouseup`: When letting go of a mouse's left button.</li><li>`mouseover`: When hovering on an element.</li><li>`mouseout`: When a mouse cursor leaves the element it was previously hovering on.</li><li>`mousewheel`: A mousewheel click.</li><li>`contextmenu`: Triggered by a right-click.</li></ul> |
| Keyboard | <ul><li>`keypress`: A particular key is pressed.</li><li>`keydown`: A key is currently being pressed.</li><li>`keyup`: A key was released.</li></ul> |
| Touch | <ul><li>`keypress`: A particular key is pressed.</li></ul> |
| Forms | <ul><li>`focus`: When the form is focused.</li><li>`blur`: When focus is taken away from the form.</li><li>`change`: When the form's value is changed.</li><li>`submit`: When the form value is submitted, either through a key or through a `<submit>` button.</li></ul> |
| Window | <ul><li>`resize`: When the viewport is resized.</li><li>`scroll`: When a scroll event is detected.</li><li>`load`: When the current page loads completely.</li><li>`unload`: When the user leaves the current page, unloading it.</li></ul> |

---

# Fetching data

Now let's add data to our layouts! So far, we've been working with static data, where we manually input every piece of content that is being shown to the user. But what if we want to fetch data from an API?

To do so, we use a `fetch` request, or a `GET` request. Let's assume that our API provides two key pairs: A title, and an image URL.

To fetch this data, we would write a `GET` request as such:

```js
fetch("https://example.com/api/random-image")
  .then(response => response.json())  // Parse the response as JSON
  .then(data => {
    const title = data.title;         // Extract the title
    const imageUrl = data.url;        // Extract the image URL
  })
  .catch(error => console.error('Error:', error)); // Catch any errors with the response
```

<iframe data-frame-title="GET Request" src="pfp-code:./get-request?template=node&embed=1&file=src%2Fscript.js" height="640"></iframe>

---

## Using `async` and `await`

We can optimize our code so that it's more readable. Using `async function` and `await`, we can remove our `.then()` commands from our code to make it simpler to understand and parse through.

```javascript
async function fetchRandomImage() {
  try {
    const response = await fetch("https://example.com/api/random-image");

    const data = await response.json();  // Parse the response as JSON

    const title = data.title;            // Extract the title
    const imageUrl = data.url;           // Extract the image URL
    
  } catch (error) {
    console.error('Error:', error);      // Handle any errors
  }
}
```

Notice that we've entirely replaced the `.then(data => {})` blocks. With `async`, those aren't necessary.

> **Learn more about `await` and `async`:**
> If you'd like to learn more about data fetching, we have an article for you!
>
> 📝 [**Explaining Promises, Async, and Await in JavaScript**](/posts/async-and-promises)

---

## Populating a layout

Now let's modify our code so that it populates an entire grid of items! 

> In the following demo, we're now iterating several times over our `fetch` function, and creating an array of items.<br>
> After the array is complete, we construct a new card for each item with `appendChild` and then append that card to the grid!

<iframe data-frame-title="Populating grid with data" src="pfp-code:./populating-grid?template=node&embed=1&file=src%2Fscript.js" height="640"></iframe>

---

# Handling errors

When handling API calls, there are several things that can go wrong. In all of the examples we've seen so far, there's been a `catch()` command, but it did very little to actually handle the erros that may have arisen from our API calls.

```javascript
catch (error) {
  console.error('Error:', error);      
  /* This will just print out the error, and won't
  handle specific errors with different actions. */
}
```

So how do we fix this?

## Handling network errors

The `response.status` command is specifically created to see if the HTTP request was successful. This means it does not validate any data from the response itself. It lets us know specifically which error codes we're given for a particular situation, like so:

```javascript
if (response.status === 404) throw new Error('Not found');
if (response.status === 500) throw new Error('Internal server error');
```

This allows developers to display diferent messages and actions to the user based on the error. For example, a user can be given a shortcut back to the previous page if given a `Not found` error; similarly, there may be a refresh button when the server had an internal error that may not happen a second time.

Here's the range of HTTP codes that can be returned.

| Code | Category |
| --- | --- |
| `100`-`199` | Informational responses |
| `200`-`299` | Successful responses |
| `300`-`399` | Redirection messages | 
| `400`-`499` | Client error responses |
| `500`-`599` | Server error responses |
| **[View all responses](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)** | Check the MDN Docs for a full breakdown. |

## Handling data errors

Now let's say that, despite expecting a certain type of data, it is not returned.

The codes we've briefly looked at do not cover these cases, and in order to catch these errors, we must validate them ourselves.

Let's use our previous examples as base to validate our data.

```javascript
async function fetchRandomImage() {
  try {
    const response = await fetch("https://example.com/api/random-image");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();  // Parse the response as JSON

    const title = data.title;            // Extract the title
    const imageUrl = data.url;           // Extract the image URL
    
  } catch (error) {
    console.error('Error:', error);      // Handle any errors
  }
}
```

By default, some data errors will be caught with `catch()`. For example, if our `data` returns a malformed JSON, that will be automatically caught when attempting to parse it with `response.json()` and an error will be thrown.

In the example above, however, we're  not ensuring that the data returned is valid. We need to be able to handle these data errors as well!

#### Custom errors

Our code expects a `title`, and an `URL`, but we're not ensuring that they exist, or if the response is valid! If any of these fails, `catch()` will not do anything on its own, which is why we must validate them ourselves.

**Let's take our previous code, completely unchanged:**

```javascript
async function fetchRandomImage() {
  try {
    const response = await fetch("https://example.com/api/random-image");
    const data = await response.json();  // Parse the response as JSON

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    switch (true) {
      case !data.title && !data.url:
        throw new Error('Both title and URL are missing.');
      
      case !data.title:
        throw new Error('Title is missing.');
      
      case !data.url:
        throw new Error('URL is missing.');
      
      /* Failing these checks, our response is valid,
      so we can create variables and assign them the values! */

      default:
        /* Extract the title */
        const title = data.title; 

        /* Extract the image URL */
        const imageUrl = data.url;           
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}
```

In the example above, we have handling all the possible cases where there may be an issue with the data given to us by our `fetch()` request.

However, you may notice all of these throw a new `Error`. What if you wanted to, instead, provide a default response if these fail, as to not break your application. We can simply modify our switch statement to provide these responses as values.

```javascript
const title = '';
const imageUrl = '';

switch (true) {
  case !data.title && !data.url:
    title = 'Title is missing.';
    url = "URL is missing.";

  case !data.title && data.url:
    title = 'Title is missing.';
    url = data.url;
  
  case data.title && !data.url:
    title = data.title;
    url = "URL is missing.";   
}
```

For this use-case, however, this is too verbose. We can define defaults for the values of `title` and `imageUrl` to further optimize our code.

```javascript
const title = data.title || 'Title is missing.';
const url = data.url || 'URL is missing.';
```

This is by far the most optimized option if you need to handle defaults and don't want to throw an `Error` if any of the data is missing or invalid!

---

# Handling loading

When dealing with large data sets or graphics, it may take some time to display content to your users. We've seen this with our grid example; our components take a while to load, but we do not display any warning to the user that we're fetching data.

Let's change that!

We're going to refactor our code so that it no longer populates our grid one by one. Instead, we are going to:

1. Wait until all images are loaded.
2. Add them to an array.
3. Populate the list with the array's contents

That way, they will all update at once.

## Meet `onload`

We can detect if something has loaded by listening to the `onload` event. As per the **[MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event)**, we can even set it as an attribute to select HTML elements.

```html
<body onload="functionName()"></body>

<img src="image.png" onload="functionName()" />

<iframe src="index.html" onload="functionName()"></iframe>

<link rel="stylesheet" href="stylesheet.css" onload="functionName()" />

<script src="main.js" onload="functionName()"></script>
```

The `onload="functionName()"` attribute calls upon the matching JavaScript function and automatically runs it once the object has been fully loaded.

Knowing this, we can refactor our code with this snippet:

```javascript
function fetchDogs() {

  // Declare the array for all cards
  const dogCardArray = [];
  const requests = [];

  for (let i = 0; i < maxItems; i++) {
    const request = fetch("https://dog.ceo/api/breeds/image/random")
    .then(response => response.json());
    requests.push(request);
  }

  Promise.all(requests)
    .then(results => {
    results.forEach(data => {

      /* 

      Unchanged

      */

      // Check when the dogImage for each card is loaded
      dogImage.onload = () => {
        // Build the dogCard components
        dogCard.appendChild(dogImage);
        dogCard.appendChild(dogName);
        dogCardArray.push(dogCard);

        /* Check if the dogArray has reached the maximum
        amount of items prior to displaying them */
        if (dogCardArray.length === maxItems) {

          /* Clear the grid as the items are ready to be rerendered. */
          dogGrid.innerHTML = '';

          /* Populate the grid */
          dogCardArray.forEach(card => {
            dogGrid.appendChild(card);
          })
        }
      }
    });
  })
    .catch(error => console.error('Error:', error));
}
```

<iframe data-frame-title="Improved grid loading" src="pfp-code:./populating-grid-improved?template=node&embed=1&file=src%2Fscript.js" height="640"></iframe>

In this demo, there are some added tweaks.

Now, when loading, all cards are slightly transparent, to show that their content is being replaced and that they are inactive.

***However, it's still not good enough.*** We want to provide a more straight-forward and accessible indicator to our users.

For this, let's actually show a loading spinner and change the label to indicate what is happening! First, we must slightly restructure our code.

1. Add the loading spinner to the button.
2. Wrap the button label in a `<p>` tag so that our `innerText` change doesn't delete the loading indicator in the process.
3. Toggle the loading indicator's position and visibility depending on our needs.

```javascript
const refreshLabel = document.getElementById("refresh-btn-label");
const loadingSpinner = document.getElementById("loading-spinner");

/* Initial state */
loadingSpinner.style.visibility = 'hidden';
loadingSpinner.style.position = 'absolute';
```

```javascript
function fetchDogs() {
  /* Change from the initial state */
  loadingSpinner.style.visibility = 'visible';
  loadingSpinner.style.position = 'unset';
  refreshLabel.innerText = "Fetching new dogs..."
  dogGrid.style.opacity = 0.5; // Fade the cards

  ...
```

```javascript
if (dogCardArray.length === maxItems) {
  dogGrid.innerHTML = '';
  dogCardArray.forEach(card => {
    refreshLabel.innerText = "Fetch new dogs";
    dogGrid.appendChild(card);
  })

  /* Hide spinner once everything is populated */
  loadingSpinner.style.visibility = 'hidden';
  loadingSpinner.style.position = 'absolute';
  dogGrid.style.opacity = 1;
}
```

**And with that, we have our final grid of items:**

<iframe data-frame-title="Finalized grid loading" src="pfp-code:./populating-grid-final?template=node&embed=1&file=src%2Fscript.js" height="640"></iframe>

---

# Conclusion

**And with that, we've reached the end of Web Fundamentals.**

I would like to thank each and every one that has read through the series, provided feedback, and those who found it helpful!

If you'd like to see more articles on this series, tackling topics that we have missed, **let us know in our Discord!** We're always monitoring blog post requests, and we'd love to help more and more people get started on their webdev journey.

I'll see you on the next one. Take care, and happy development!