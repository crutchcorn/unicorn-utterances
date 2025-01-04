---
{
	title: "The History of CJS and ESM",
	description: "",
	published: '2024-12-05T05:12:03.284Z',
	tags: ['javascript', "webdev"],
	license: 'cc-by-nc-sa-4'
}
---

While working in the NodeJS ecosystem, you may have heard of "ESM" or "EcmaScript Modules". Alternatively, maybe you've heard of "CJS" or "CommonJS Modules".

They're even front-and-center in many of Node's current docs:

<!-- TODO: Add docs examples -->

But what is CJS and ESM?

Well, the short answer is that they're competing methods of importing one JavaScript file to another:

```javascript
// CJS
const file = require('./file');
// ESM
import * as file from "./file";
```

Continuing the short answer, ESM is much newer and most standard; as such is generally advised to use over CJS nowadays.

But this answer ignores a lot of nuance. Not only do CJS and ESM have vastely different constraints under-the-hood, but CJS usage in the Node ecosystem is still broader than ESM usage.

Why is that? How do they differ? How.did we end up here?

Well, let's take a look at the history of JavaScript to answer that question.


# Origins of JavaScript

The intial release of JavaScript (then called Mocha) was famously written in a few weeks in 1995 by Brendan Eich.

<!-- TODO: Link the week quote above -->

> DIdn't think we'd go that far back, huh?

See, Eich was contracted by Netscape Communications in order to write a scripting language companion for the browser; similar to how Visual Basic operated for C/C++ in the Microsoft/Windows world. 

Little did they know how far it would go. 

Mocha, then shortly renamed to Livescript, would catch the attention of Sun Microsystems - the then-owner of the quickly growing programming language Java.

Through an agreement with Sun, Netscape Communciations would rename Mocha/LiveScript to JavaScript and make it the official scripting language of thier browser: NetScape Navigator 2.0.

# Netscape and 90s Server-Side JavaScript

But by 1996 NetScape isn't just a browser company; they're a big deal in the software engineering space.

And, important to our context, they're using JavaScript on the server through a program called "LiveWire".

Here, [we can see a reference to NetScape's LiveWire server in a 1996 article from CNET](https://www.cnet.com/tech/tech-industry/netscape-opens-intranet-attack/) and even [a reference guide to server-side JavaScript that dates back to 1998](https://docs.oracle.com/cd/E19957-01/816-6411-10/contents.htm).

It's clear that they were all-in on JavaScript; a senseable decision given their ownership over the language.

By 1999 JavaScript had matured enough to standardize on a stable version usable external to NetScape: ES3.

Well, Netscape turned into Mozilla:

https://www.mozilla.org/en-US/about/history/

And they continued to utilize much of the same server-side JavaScript technology

But there's a problem:

How do you write multiple files of JavaScript and manage the relationships between them?

# CommonJS and 2009 Heatup

Well, Jan 2009 hits and Mozilla thinks they have an answer: CommonJS

https://www.blueskyonmars.com/2009/01/29/what-server-side-javascript-needs/

Later in the year, (June) at JSConf 2009, there's a small project announced that utilizes this new CommonJS (CJS) method of dependency management by Ryan Dahl: Node.js

https://www.youtube.com/watch?v=ztspvPYybIY (interesting historical piece, explains why he made it)

Later that year, in December 2009 the ES5 spec released (https://www.ecma-international.org/wp-content/uploads/ECMA-262_5th_edition_december_2009.pdf)


[which was of course implemented throughout the next year or two for browsers]

With ES5 something new came along:

`"use strict"` (aka "Strict Mode")

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode

This helped solves some of the misbehaving issues with JavaScript and could flag a specific mode to your browser (and JS engine) that it could make assumptions about your code to speed up, handle errors better, etc


## ES4 and ES6

https://auth0.com/blog/the-real-story-behind-es4/

Well, this ES5 launch came after the ES4 debacle, right?

But remember; ES4 was left in the past without any new features or changes to the lang made in ES4 making it into ES5

Along that path, there was a conversation about packages in JS:

http://archives.ecma-international.org/2006/misc/es4lang-Jan06.pdf (check "Packages")

So, ES6 acting as the spiritual "Bring all the goodies from ES4 to life" release wanted to standardize how dependencies could be handled and imported

Introducing: ES Modules (or, ESM)

https://262.ecma-international.org/6.0/#sec-modules

But wait, why didn't the just use CommonJS?

The answer? The browser.

## Why not use CJS?

Among other issues, CJS:

- Is synchronous, which is a no-no in the event thread, especially when network has higher latency than disk I/O
- Allows for dynamic imports (hard to resolve from the server)

And more

https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/

Crazy enough, we wouldn't get dynamic `import` statements until 2017! https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import

But see there inlies the problem, right?

Language specification writing (and getting everyone to agree on implementation detail/etc) is **hard** and takes a long time!

So by the time browsers implemented `import` and it was even theoretically worthwhile to invest in migrating away from CJS, CommonJS had been around for 18 years!

Keep in mind, this ignores things like `require("file.json")`, which was introduced with `import assert` and _still_ isn't part of the language specification despite inclusion in NodeJS 16+and Chrome 91+:

https://v8.dev/features/import-assertions

That was only introduced in **2021** and **still isn't part of the ECMAscript spec itself**:

https://github.com/tc39/proposal-import-assertions

So, we talked about how browsers added `import` support in ~2017-2018.

That was """"easy enough"""" (engineering hard):

Just add a new import syntax. CJS never worked in the browser, so easy enough

# CJS vs ESM Today

But now we have a problem:

Node has supported CJS for 9-10 years. As a result NPM and its millions of packages are literally built around it as a core concept.

How can we make sure that CJS packages still work in ESM apps?

Can we support ESM packages in CJS in a backwards compatible way?

The answer?

> It's complicated.

VERY broadly, you can import a CJS package from ESM, but not vice-versa.

But that's ignoring how JS resolving these files work, ignores `.mjs`, `.cjs` and more. 

Those are kinda outside of the scope of this history lesson so you might wanna refer to:

https://nodejs.org/api/esm.html#esm_enabling
https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

So the long story short of this all is:

CJS === `require("pkg");`

ESM === `import "pkg";`

But the answer of "how do these work together" is really complicated because, despite `import` being newer, we're still in relatively early days of the migration processes

This is shown by the progress of the percentage of NPM packages which use ESM/CJS/ or both over the last two years:

https://github.com/wooorm/npm-esm-vs-cjs

![TODO: // Write](./esm-usage-chart.png)

--------------

-------------------

-------------




--------------

-------------------

-------------

------------

---------------------------


Oh jeez gold mine for CJS history:

https://wiki.commonjs.org/wiki/Modules

--------------

-------------------

-------------

------------

---------------------------

Wow. There is so much more to CommonJS and Node's origin than I outlined

https://github.com/nodejs/node-v0.x-archive/issues/5132#issuecomment-15503151





--------------



-------------------

-------------

------------

---------------------------



--------------



-------------------

-------------

------------

---------------------------



--------------



-------------------

-------------

------------

---------------------------



--------------



-------------------

-------------

------------

---------------------------



--------------



-------------------

-------------

------------

---------------------------



--------------



-------------------

-------------

------------

---------------------------



--------------



-------------------

-------------

------------

---------------------------



Links to specific JS versions and releases:

https://en.wikibooks.org/wiki/JavaScript/History_of_JavaScript



2008 Interview w/ Eich about Mocha -> Livescript:

https://www.infoworld.com/article/2653798/javascript-creator-ponders-past-future.html 



History of ECMAScript versions:

https://en.wikipedia.org/wiki/ECMAScript_version_history



JS History timeline:

https://auth0.com/blog/the-real-story-behind-es4/#An-ECMAScript-timeline



# History

- Dec 1994 Netscape Navigator 1.0 released
- [April 1995 Brenden Eich hired to make a "Scheme-like" programming language](https://en.wikipedia.org/wiki/Brendan_Eich)
- [May 1995 Mocha invented](https://nestify.io/blog/brief-history-of-javascript/) [in 10 days](https://web.archive.org/web/20160305202500/http://www.computer.org/csdl/mags/co/2012/02/mco2012020007.pdf)

- [September 1995 Mocha renamed to Livescript & first beta release of Netscape Navigator 2.0](https://nestify.io/blog/brief-history-of-javascript/)

- [December 1995 LiveScript renamed to JavaScript & Netscape 2.0 final release](https://web.archive.org/web/20020606002913/http://wp.netscape.com/newsref/pr/newsrelease67.html)
- [1996 JavaScript used on server (LiveWire)](https://www.cnet.com/tech/tech-industry/netscape-opens-intranet-attack/)
- [November 1996 NetScape starts talks with ECMA](https://web.archive.org/web/19981203070212/http://cgi.netscape.com/newsref/pr/newsrelease289.html)
- [June 1997 ECMAScript v1 releases](https://ecma-international.org/wp-content/uploads/ECMA-262_1st_edition_june_1997.pdf)
- [August 1998 ECMAScript v2 releases](https://ecma-international.org/wp-content/uploads/ECMA-262_2nd_edition_august_1998.pdf)
- [1998 Mozilla founded & NetScape browser source code released](https://www.mozilla.org/en-US/about/history/)
  - [First edition based on JavaScript 1.1 as implemented in Netscape Navigator 3.0.](https://web.archive.org/web/19970614042441/http://home.netscape.com/eng/mozilla/3.0/handbook/javascript/index.html)
- [December 1999 EcmaScript v3 releases](https://ecma-international.org/wp-content/uploads/ECMA-262_3rd_edition_december_1999.pdf)
  - [Based on JavaScript 1.2 as implemented in Netscape Navigator 4.0.](https://web.archive.org/web/19990420172150/http://developer.netscape.com/docs/manuals/communicator/jsref/index.htm)
- [Jan 2009 CommonJS letter from Mozilla](https://www.blueskyonmars.com/2009/01/29/what-server-side-javascript-needs/)
- [June 2009 Node.js released](https://www.youtube.com/watch?v=ztspvPYybIY )
- [Dec 2009 ES5 Spec Released](https://ecma-international.org/wp-content/uploads/ECMA-262_5th_edition_december_2009.pdf)
- [2013 Thread on Node.js & CommonJS](https://github.com/nodejs/node-v0.x-archive/issues/5132#issuecomment-15432598)
