---
{
	title: "Introduction to HTML, CSS, and JavaScript",
	description: 'Introduction to the underlying concepts of HTML, CSS, and JavaScript and how they work together.',
	published: '2019-12-16T13:45:00.284Z',
	edited: '2024-11-25',
	tags: ['html', 'css', 'javascript'],
  	authors: ["MDutro"],
	license: 'publicdomain-zero-1',
  	order: 0
}
---

**So you have decided to learn web development.**

Great! But once you start looking around for tutorials, guides, and other resources, it's easy to get overwhelmed. Web development incorporates a lot of different technologies that all work together to create the internet as we know it today. 

Understanding how they work together is no small task, especially when you are at the beginning of your web development journey. Which ones should you learn first? What do they do? What does it all mean?

Playful Programming is here to help. Let's start at the beginning.

# Introduction

At a very basic level, all websites are constructed from three foundational technologies: HTML, CSS, and JavaScript. **Every other concept or technology related to front-end web development is either based on or works with one of these three building blocks.** Getting a firm grasp on HTML, CSS, and JavaScript is critical to understanding web development and learning how to create your own websites and web applications.

# HTML

HTML stands for [HyperText Markup Language](https://developer.mozilla.org/en-US/docs/Web/HTML), and the latest release is HTML5. HTML is the foundation of the modern internet. Every website you visit or web application you use is built on a structure created by an HTML document.

A great way to visualize what HTML does is to think of a building under construction. All buildings have a frame, whether steel or wood, that creates the basic structure of the building from the foundation to the roof. This structure dictates the size and shape of the building; no matter what the building looks like when it is finished or the purpose it serves, everything will be built around that steel structure.


**HTML is the steel frame of the user's interaction with any given website.** It is the structure that websites are built around and it tells your web browser how to construct the site you are visiting. 

Just like you don’t see the wooden framing of your house once it is built, the structural parts of HTML are ordinarily hidden from view. Your web browser uses it to build the site, along with CSS and JavaScript, and present it to you in the way that the developer intended.

So, HTML gives a website its structure. But how does it do that?

### Elements

At its most basic level, HTML builds the structure of a webpage by using something called "elements" which are normally invisible to the casual website visitor. But even if you can't see them, you can usually guess where they are. That’s because elements are used to divide a web page into logical sections. When you see a navigation bar, a title, paragraphs of text, or a footer, you can be sure there is at least one HTML element associated with it.

If HTML is like the steel frame of a building, then elements are like the individual beams that make up the frame. Elements are defined by small chunks of text called ["tags"](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Getting_started) that define where an element begins and ends. There are many different tags, and they can be organized in many ways - you can even nest tags inside each other - but the important thing to remember here is that the web browser on your computer reads these tags from the top of the HTML document to the bottom. Items on a website can be visually rearranged by CSS or JavaScript but their initial position on the page is set by their position in the HTML document itself.

If you want to see the HTML of a website, all you have to do is access the developer tools in [Chrome](https://developers.google.com/web/tools/chrome-devtools/open) or [Firefox](https://developer.mozilla.org/en-US/docs/Tools).

HTML also serves as the foundation for web accessibility for people with disabilities. [Screen readers](https://www.afb.org/blindness-and-low-vision/using-technology/assistive-technology-products/screen-readers) allow people who are blind or have low vision to use the internet in a primarily audio format. They work by reading the HTML directly and are programmed to follow its structure and pick up on information included in the element tags. Practicing good [web accessibility standards](https://www.w3.org/WAI/standards-guidelines/wcag/) is important for a modern web developer and makes websites that are easier to use for everyone.

> **Learn more about accessibility:**
> If you'd like to learn more about accessibility standards and best practices, we have an article for you!
>
> 📝 [**Introduction to Web Accessibility**](/posts/intro-to-web-accessibility)

> 📝 [**Web Fundamentals: HTML**](/posts/web-fundamentals-html)

---

# CSS

CSS, or Cascading Style Sheets, is what web developers use to control the look and feel of the websites they create.

**Let's think back to our building construction analogy for a moment.** We have our steel frame - HTML - but what will the building look like when it is finished? *Will the facade be brick, wood siding, or cut stone? Should it be painted? If so, what color?* These are the kinds of questions that web developers use CSS to answer.

CSS can be used to control virtually every visual aspect of a website. Take a look at the site you are reading right now. Everything on it is controlled (or "styled" as the lingo goes) by CSS. The background color, the color of the text, the size of the text, where images or videos appear on the page, the location of the navigation bar, and even some animations are set by CSS.

### Stylesheets

In modern web development, CSS is written in a separate document called a "stylesheet" that is referenced in the HTML document with a link element.

The stylesheet contains a list of HTML elements, identified by various "selectors", that the developer wants to style. Each element may contain any number of [properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Properties_Reference) and property values that set up how that element will be presented to the user in the web browser. These properties have a specific mapping to various aspects of how the page is styled. For now, just know that CSS rules can inherit property values from each other and can even override each other in certain circumstances.

CSS is a big topic, and you will very likely be learning more about it as long as you do web development. There are pre-made frameworks, preprocessors, and lots of other CSS-related goodies out there to dive into as you learn your new craft. The important thing at the outset is to learn the basics well so that you know what to expect as you write your own CSS stylesheets.

> 📝 [**Web Fundamentals: CSS**](/posts/web-fundamentals-css)

---

# JavaScript

JavaScript is the programming language of the internet and web browsers. When you are shopping online, JavaScript is happening. When you check your local weather radar, JavaScript is happening. When you use social media, JavaScript is happening. **Basically, JavaScript is what gives websites and web applications the ability to actually do something.**

Just like CSS, JavaScript is normally written in a separate file and connected by reference to the HTML itself. JavaScript is an “interpreted” language, which means that the code is run by the browser at the time it is activated. Some JavaScript code is set to run automatically when the page loads, while some sits dormant waiting to spring into action based on user input.

**As I said before, JavaScript is a for-real programming language.** That means it has arrays, for loops, if-else statements, and lots of other computer science-y things going on.

Despite that, the language is actually very beginner-friendly. You don’t have to have a degree in computer science or arcane mathematics to get started with a programming language, and, because of the way JavaScript interacts with web browsers, you will be to do some amazing things pretty quickly.

### DOM

One thing that makes JavaScript unique is [its ability to manipulate the DOM](/posts/understanding-the-dom/). The Document Object Model (or DOM) is an API (advanced programming interface) that allows JavaScript to manipulate the HTML and CSS of a website as the user navigates around the page and uses its features. Basically, the web browser can read JavaScript and make changes to the look, feel, and even the structure of the page in real-time.

To go back to our building construction analogy… well, it starts to break down at this point. Imagine if you could wave a magic wand and turn the wood siding on your building into bricks. Or change the color of the building from gray to bright blue. Remember the steel beams of HTML our building is made of on the inside? By using the DOM, JavaScript can change those too!

JavaScript is a powerful tool that can be used to create everything from useful applications, to convenient shopping experiences, and even games. JavaScript is complex, and there is a lot to learn, but there are a lot of great free [resources](https://developer.mozilla.org/en-US/docs/Web/JavaScript) out there to learn the basics and get started writing code from scratch.

> 📝 [**Web Fundamentals: JavaScript Basics**](/posts/web-fundamentals-javascript-basics)

---

# Conclusion

Now you should have a better conceptual understanding of the primary web technologies, what they do, and how they work together to create the internet that we see and use every day. Once you learn the basics of HTML, CSS, and JavaScript, you will have a firm foundation to build on to create your own websites and applications.

Finally, you're always able to [**join our Discord**](https://discord.gg/FMcvc6T) if you have any questions or comments while you're learning. All are welcome!

---