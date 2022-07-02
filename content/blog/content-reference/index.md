---
{
    title: "Content Reference",
    description: "Oftentimes, when passing children to a component, you want a way to programmatically access that passed data. Let's learn how to do that in React, Angular, and Vue.",
    published: '2023-01-01T22:12:03.284Z',
    authors: ['crutchcorn'],
    tags: ['webdev'],
    attached: [],
    order: 9,
    series: "The Framework Field Guide"
}
---

This isn't to say that there are no practical applications of what we'll be learning about in this chapter, just that the things we'll learn about are often applied in niche circumstance, and I can't reasonably think of how to integrate it into what we've built thus far.

The concepts I want to talk about today is the idea of "Content reference". 

In our last chapter, we demonstrated how you're able to provide content as a child of another component. This means that we can make the follow pseudo-syntax something of a reality in each given framework:

```jsx
<FileTableContainer>
	<FileTableHeader/>
	<FileTableBody/>
</FileTableContainer>
```

Now here's a question for you: Can you then access those children from JavaScript and interact with them programmatically?
Answer: Yes.

Let's start by getting a list of each item passed as a child.

<!-- tabs:start -->

# React

React has a built-in helper called `Children` that will help you access data passed as a child to a component. Using this `Children` helper, we can utilize the `toArray` method to create an array from `children` that we can then do anything we might otherwise do with a typical array.

This comes in handy when trying to access the `length` count. 

```jsx
import {Children} from 'react';

const ParentList = ({children}) => {
  const childArr = Children.toArray(children);
  console.log(childArr); // This is an array of ReactNode - more on that in the next sentence
  return <>
    <p>There are {childArr.length} number of items in this array</p>
    <ul>
		{children}
	</ul>
    </>
}

const App = () => {
	return (
		<ParentList>
			<li>Item 1</li>
			<li>Item 2</li>
			<li>Item 3</li>
		</ParentList>
	)
}
```

Here, `childArr` is an array of type `ReactNode`. A `ReactNode` is created by React's `creacteElement` method.

> Remember that JSX transforms to call React's `createElement` node under-the-hood.
>
> This means that the following JSX:
> ```jsx
> const el = <div/>
> ```
>
>   Becomes the following code after compilation:
>
> ```javascript
> const el = React.createElement('div');
> ```

There also exists a `Children.count` method that we could use as an alternative if we wanted.

```jsx
const ParentList = ({children}) => {
  const childrenLength = Children.count(children);
  return <>
    <p>There are {childrenLength} number of items in this array</p>
    <ul>
		{children}
	</ul>
    </>
}
```

# Angular

Before we talk about accessing projected content programmatically in Angular, we need to first touch on a concept called "template tags".

In an earlier chapter, we had some `if ... else` code that looked like this:

```html
<span *ngIf="isFolder; else fileDisplay">Type: Folder</span>
<ng-template #fileDisplay><span>Type: File</span></ng-template>
```

And referred out to [an external article](https://unicorn-utterances.com/posts/angular-templates-start-to-source) to explain more. While I still suggest reading through that article at some point (I wrote it, after all), let's explain a bit more in-depth.

## What's a template, anyway? {#ng-templates}

See, an `ng-template` allows you to store multiple tags as children without rendering them.

Take the following code:

```html
<ng-template>
	Hello, <strong>world</strong>!
</ng-template>
```

This will convert to the following HTML:

```html
 
```

> Wait, but there's nothing there...

Correct! By default, an `ng-template` will not render anything at all.

> So then what's the point?

The point, my dear reader, is that you can assign a in-template variable to `ng-template` and use it elsewhere. These in-template variables are called "template tags" and are created by assigning an octothorpe (`#`) prefixed attribute to the `ng-template`.  

```html
<ng-template #tag>
   This template is now assigned to the "tag" template variable. 
</ng-template>
```

We can then use the template tag as we might expect any other variable to be used; we can pass a template variable to a function of sorts (in the form of a [structural directive](https://unicorn-utterances.com/posts/angular-templates-start-to-source#structural-directives), like `*ngFor` or `*ngIf`) and see it's usage reflected.

```html
<span *ngIf="false; else trueTag">False</span>
<ng-template #trueTag>True</ng-template>
```

Here, we're passing the `trueTag` to the `else` value of `ngIf`, which will render when the passed value is `false`.

## There can only be one: `ContentChild`

These template tags aren't simply useful in `ngIf` usage, however. We can also use them in a myriad of programmatic queries, such as `ContentChild`.

`ContentChild` is a way to query the projected content within `ng-content` from JavaScript.

```typescript
import {
  NgModule,
  Component,
  AfterContentInit,
  ContentChild,
  ElementRef,
} from '@angular/core';

@Component({
  selector: 'parent',
  template: `
    <ng-content></ng-content>
  `,
})
class ParentListComponent implements AfterContentInit {
  @ContentChild('childItem') child: ElementRef<HTMLElement>;

  // This cannot be replaced with an `OnInit`, otherwise `children` is empty.
  ngAfterContentInit() {
    console.log(this.child.nativeElement); // This is an HTMLElement
  }
}

@Component({
  selector: 'my-app',
  template: `
  <parent>
    <p #childItem>Hello, world!</p>
  </parent>
  `,
})
class AppComponent {}
```

Here, we're querying for the template tag `childItem` within the project content by using [the `ContentChild` decorator](https://angular.io/api/core/ContentChild). `ContentChild` then returns [a TypeScript generic type](https://unicorn-utterances.com/posts/typescript-type-generics) of `ElementRef`. `ElementRef` is a type that has a single property called `nativeElement` containing the [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) in question.

### Sounds like a song lyric: `ngAfterContentInit`

> Tell me you couldn't imagine a power ballet from the 80s with that in it.

If you were looking at the last code sample and wondered:

> "What is `ngAfterContentInit` and why are we using it in place of `ngOnInit`?" 

Then you're asking the right questions!

See, if we replace our usage of `ngAfterContentInit` with a `ngOnInit`, then we get `undefined` in place of `this.child`:

```typescript
@Component({
  selector: 'parent',
  template: `
    <ng-content></ng-content>
  `,
})
class ParentListComponent implements OnInit {
  @ContentChild('childItem') child: ElementRef<HTMLElement>;

  ngOnInit() {
    console.log(this.child); // This is `undefined`
  }
}
```

This is because while `ngOnInit` runs after the component has rendered, it has not yet received any values within `ng-content`; This is where `ngAfterContentInit` comes into play. This lifecycle method runs once `ng-content` has received the values, which we can then use as a sign that `ContentChild` has finished it's query.

<!-- Editors note: This isn't true. `{static: true}` fixes this problem for us -->

<!-- TODO: Make this true -->

## And then there were more: `ContentChildren`

While `ContentChild` is useful for querying against a single item being projected, what if we wanted to query against multiple items being projected?

This is where `ContentChildren` comes into play:

```typescript
import {
  NgModule,
  Component,
  AfterContentInit,
  ContentChildren,
  QueryList,
} from '@angular/core';

@Component({
  selector: 'parent-list',
  template: `
    <p>There are {{children.length}} number of items in this array</p>
    <ul>
      <ng-content></ng-content>
    </ul>
  `,
})
class ParentListComponent implements AfterContentInit {
  @ContentChildren('listItem') children: QueryList<HTMLElement>;

  ngAfterContentInit() {
    console.log(this.children);
  }
}

@Component({
  selector: 'my-app',
  template: `
  <parent-list>
    <li #listItem>Item 1</li>
    <li #listItem>Item 2</li>
    <li #listItem>Item 3</li>
  </parent-list>
  `,
})
class AppComponent {}
```

`ContentChildren` returns an array-like [`QueryList`](https://angular.io/api/core/QueryList) generic type. You can then access the properties of `children` inside of the template itself, like what we're doing with `children.length`. 

# Vue

While both React and Angular are fairly easily able to count the number of children within their respective `children`, Vue is unable to without a drastic refactor of the `ParentList` component.

Generally, this is because while you _can_ access children from the other frameworks, you often _shouldn't_ rely on that behavior. Instead, it's typically suggested to [raise the state of your query from the child to the parent, in order to keep your code more consolidated and organized](// TODO: Link).

<!-- Editor's note: While yes, we could do a `mounted() {this.$slots.children}` for THIS example, two things: 1) It's bad practice in that it will cause two renders. 2) It breaks in the very next code sample -->

<!-- Editors note: It breaks in the next sample because if you add `updated` to listen for changes, then call `this.$slots.default()` it will trigger an infinate render, since it will in turn re-trigger `updated -->

This means that you might take the following code:

```javascript
const ParentList = {
  template: `
  <ul>
   	<p>There are ? number of items in this array</p>
    <slot></slot>
  </ul>
  `,
};

const App = {
  template: `
    <parent-list>
	  <li>Item 1</li>
	  <li>Item 2</li>
      <li>Item 3</li>
    </parent-list>
  `,
  components: {
    ParentList,
  },
};
```

And instead generate each `li` using a `v-for` and pass the `list.length` to `parent-list` like so:

```javascript
const ParentList = {
  template: `
  <ul>
  	 <p>There are {{list.length}} number of items in this array</p>
    <slot></slot>
  </ul>
  `,
  props: ['list']
};

const App = {
  template: `
    <parent-list :list="list">
	  <li v-for="i in list">Item {{i}}</li>
    </parent-list>
  `,
  components: {
    ParentList,
  },
  data() {
  	return {
  		list: [1, 2, 3]
  	}
  }
};
```

However, if you absolutely positively really, no, for sure just needed a way to count `children` on the `ul` element, you could do so using `document.querySelector ` in [the `mounted` lifecycle method](lifecycle-methods#Lifecycle-Chart).

```javascript
const ParentList = {
  template: `
  <p>There are {{children.length}} number of items in this array</p>
  <ul id="parentList">
    <slot></slot>
  </ul>
  `,
  data() {
    return {
      children: [],
    };
  },
  methods: {
    findChildren() {
      return document.querySelectorAll('#parentList > li');
    },
  },
  mounted() {
    this.children = this.findChildren();
  }
};
```

This doesn't _quite_ follow the same internal logic pattern as our examples in React or Angular, however, which is why it's a bit of an aside.

<!-- Editor's note: While `$el` might seem like a viable alternative to an ID, it's not due to the fact that we have multiple root HTML nodes. This means that `$el` is a VNode, not an `HTMLElement` and therefore does not have a `id` property -->

> There _technically_ is a way to count the number of children nodes within Vue in the same way that React and Angular can. However, be warned that the syntax for doing so isn't very elegant and a more in-depth explaination is out-of-scope for this chapter.
>
> By utilizing [Vue's `h` function and a component's `render` method](https://vuejs.org/guide/extras/render-function.html), you can do something like this:
>
> ```javascript
> const ParentList = {
>   render() {
>     const slotRenderVal = this.$slots.default();
>     return [
>       h('p', {}, [
>         'There are ',
>         slotRenderVal.length,
>         ' number of items in this array',
>       ]),
>       h('ul', { id: 'parentList' }, slotRenderVal),
>     ];
>   },
> };
> ```

<!-- tabs:end -->



We can see that this reference to children is dynamic and will update even when using a template-driven loop.

<!-- tabs:start -->

# React

```jsx
import {Children, useState} from 'react';

const ParentList = ({children}) => {
  const childArr = Children.toArray(children);
  console.log(childArr);
  return <>
    <p>There are {childArr.length} number of items in this array</p>
    <ul>
		{children}
	</ul>
    </>
}

const App = () => {
    const [list, setList] = useState([1, 42, 13])
    
    const addOne = () => {
        // `Math` is built into the browser 
        const randomNum = Math.floor(Math.random() * 100)
        setList([...list, randomNum]);
    }
	return (
        <>
		<ParentList>
			{list.map((item, i) => 
                      <li key={i}>{i} {item}</li>
            )}
		</ParentList>
        <button onClick={addOne}>Add</button>
        </>
	)
}
```

# Angular

<!-- Editor's note: `console.log(this.children)` will not occur when `QueryList` is updated -->

```typescript

@Component({
  selector: 'parent-list',
  template: `
    <p>There are {{children.length}} number of items in this array</p>
    <ul>
      <ng-content></ng-content>
    </ul>
  `,
})
class ParentListComponent implements AfterContentInit {
  @ContentChildren('listItem') children: QueryList<HTMLElement>;

  ngAfterContentInit() {
    console.log(this.children);
  }
}

@Component({
  selector: 'my-app',
  template: `
  <parent-list>
    <li *ngFor="let item of list; let i = index" #listItem>{{i}} {{item}}</li>
  </parent-list>
  <button (click)="addOne()">Add</button>
  `,
})
class AppComponent {
  list = [1, 42, 13];

  addOne() {
    const randomNum = Math.floor(Math.random() * 100);
    this.list.push(randomNum);
  }
}
```

It's worth noting that when you run `addOne` (by pressing the "Add" button), it will not re-run `ngAfterContentInit`'s `console.log`. To do this, we need to access the `changes` "Observable" and listen for changes:

```typescript
ngAfterContentInit() {
  console.log(this.children);

  // `subscribe` comes from the `changes` RxJS observable 
  this.children.changes.subscribe((childElements) =>
     console.log(childElements)
  );
}
```

> Wait wait wait, what's an "Observable"?

An Observable is an object type that allows you to listen to a series of events via a push-based listening method. In Angular, these Observables are powered by a library called [RxJS](https://rxjs.dev/) that Angular builds upon.

> RxJS is an incredibly powerful library that's well worth learning in the Angular world. While this book/course won't touch on RxJS much (simply because it's a topic worth it's own book series), a great learning resource for RxJS might be: ["RxJS Fundamentals" by the "This Is Learning" community.](https://this-is-learning.github.io/rxjs-fundamentals-course/)

To quickly synopsis what our `changes` observable does:

- Emits data when `children` is updated with new elements
- `subscribe` then listens to these emitted events, run the containing function with the updated value of `this.children`

# Vue

As we mentioned previously, it's not possible to use the `<slot>` information to count how many items there are being passed to the slot. Because of this, we've decided to forgo the code sample associated with life updating this count.

This isn't to say that the lack of the ability to easily count slotted children is a big deal; you wouldn't implement code exactly like this in production for 99.99% of cases. Remember, this chapter started by mentioning "Let's take a break from the immediately practical".

> If you wanted to continue listening for events using the `querySelectorAll` trick, you can listen for re-renders using [the `updated()` lifecycle method](lifecycle-methods#Lifecycle-Chart) to live refresh the number of lists of items in the array.
>
> ```javascript
> const ParentList = {
>   template: `
>   <p>There are {{children.length}} number of items in this array</p>
>   <ul id="parentList">
>     <slot></slot>
>   </ul>
>   `,
>   data() {
>     return {
>       children: [],
>     };
>   },
>   methods: {
>     findChildren() {
>       return document.querySelectorAll('#parentList > li');
>     },
>   },
>   mounted() {
>     this.children = this.findChildren();
>   },
>   updated() {
>     this.children = this.findChildren();
>   },
> };
> ```
> Just remember that this isn't working the same way the other frameworks are counting the passed content items under-the-hood, which is again why this is an aside.

<!-- tabs:end -->

Here, we can see that whenever a random number is added to the list, our list item counter still increments properly.

# Passing Values to Projected Content

While counting the number of items in a list is novel, it's not a very practical use of accessing projected content in JavaScript.

Instead, let's see if there's a way that we can pass values to our projected content. For example, let's try to change the background color of each `li` item if the index is even or odd.



<!-- tabs:start -->

## React

As part of React's `Children` utilities, we're able to `cloneElement` on each item in the `children` array in order to pass React properties. We can use this logic to pass properties that include styling when the index is even or odd.

```jsx
import {Children, useState} from 'react';

const ParentList = ({ children }) => {
  const childArr = Children.toArray(children);
  const newChildArr = childArr.map((node, i) =>
    React.cloneElement(node, {
      style: { backgroundColor: i % 2 ? 'grey' : '' },
    })
  );
  return (
    <ul>{newChildArr}</ul>
  );
};
```

React is the only framework that's able to pass parameters to projected content without modifying the callers' codebase. This means that we only need to update `ParentList` and not `App` to change the `style` prop for each `li` that `App` passes.

## Angular

Angular is not able to pass properties directly to `ng-content` projected nodes without utilizing `ContentChildren` and a bit of magic.

In order to explain this magic, we have to walk through some pre-requisite knowledge.

### Back to the start: `ng-template` rendering

 [As we explained earlier in the chapter](#ng-templates), `ng-template` is useful for assigning parts of your template to a variable that you can then use elsewhere.

What we didn't mention in this previous section is how to display `ng-template` without utilizing an `ngIf`:

```html
<!-- This is the template to be rendered -->
<ng-template #renderMe>Hello, world!</ng-template>
<!-- `ngTemplateOutlet` renders the passed template -->
<ng-container *ngTemplateOutlet="renderMe"></ng-container>
```

Here, we can use [the `ngTemplateOutlet` structural directive](https://angular.io/api/common/NgTemplateOutlet) to pass a template in to be rendered to an `ng-container`.

> In order to use this, you'll need to import [`CommonModule`](https://angular.io/api/common/CommonModule) to your `AppModule`'s `import` array:
>
> ```typescript
> import { CommonModule } from '@angular/common';
> 
> @NgModule({
>   imports: [CommonModule, BrowserModule],
>   // ...
> })
> ```

We can also ["unwrap" the structural directive](https://unicorn-utterances.com/posts/angular-templates-start-to-source#structural-directives) to an attribute of `ng-template` in order to render them as an alternative syntax.

```html
<!-- This is the same as <ng-container *ngTemplateOutlet="renderMe"></ng-container> -->
<ng-template [ngTemplateOutlet]="renderMe"></ng-template>
```

This alternative syntax works exactly the same as the structural directive we demonstrated earlier.

### Template Contexts

> But why? `ng-template` doesn't seem to do very much outside of contain values.

Aha! That's where you're wrong! You've been fooled again people, `ng-template` is more powerful than I've been letting on.

See, not only does `ng-template` allow you query values and assign template tags, but you're also able to pass values to an `ng-template` when rendering via a `ngTemplateOutlet`. These passed values are called "`context`" values and can be passed with `ngTemplateOutletContext`:

```html
<ng-template #messageDisplay let-message="message">
  <p>{{msg}}</p>
</ng-template>

<ng-template [ngTemplateOutlet]="messageDisplay" [ngTemplateOutletContext]="{message: 'Hello, world!'}"></ng-template>
<!-- Or, an alternative syntax with the same functionality -->
<ng-container *ngTemplateOutlet="messageDisplay; context: {message: 'Hello, world!'}"></ng-container>
```

Here, we're using [Angular's structural directive microsyntax](https://unicorn-utterances.com/posts/angular-templates-start-to-source#Microsyntax) to say "give me the `message` property of the `context` object and assign it to a template tag of `msg`." We're then taking that `msg` value and rendering it into a `p` element.

### Putting it together

OK, still with me? Great!

At this point we know a few things about Angular:

1) `ng-template` does not render anything by default
2) You can assign a template variable to a `ng-template`
3) `ContentChildren` can query projected children and assign them to an array-like `QueryList`
4) You can pass values to a rendered `ng-template` using a `context`

Knowing these things, let's put it all together to create a checkered list of items; each odd numbered row will have a grey background.

```typescript
@Component({
  selector: 'parent-list',
  template: `
    <p>There are {{children.length}} number of items in this array</p>
    <ul>
      <ng-template *ngFor="let template of children; let i = index" [ngTemplateOutlet]="template" [ngTemplateOutletContext]="{backgroundColor: i % 2 ? 'grey' : ''}"></ng-template>
    </ul>
  `,
})
class ParentListComponent {
  @ContentChildren('listItem', { read: TemplateRef }) children: QueryList<
    TemplateRef<any>
  >;
}

@Component({
  selector: 'my-app',
  template: `
  <parent-list>
    <ng-template #listItem *ngFor="let item of list; let i = index" let-backgroundColor="backgroundColor">
      <li [style]="{backgroundColor}">{{i}} {{item}}</li>
    </ng-template>
  </parent-list>
  <button (click)="addOne()">Add</button>
  `,
})
class AppComponent {
  list = [1, 42, 13];

  addOne() {
    const randomNum = Math.floor(Math.random() * 100);
    this.list.push(randomNum);
  }
}
```

Here, we're using everything we've covered to this point in order to render out `listItem` `ng-template` inside of `ParentListComponent`. We're doing this by utilizing `ContentChildren` to `read` each template passed as projected children and re-rendering those templates with `ngTemplateOutlet`. Those rendered templates are then passed a context with a `backgroundColor` property that changes the bound `[style]` attribute.

Whew! What a mouthful. 

## Vue

In order to color the background of each list item, let's continue off of the code of our "raised state" where we're rendering our `list` with a `v-for`:

```javascript
const ParentList = {
  template: `
  <ul>
  	 <p>There are {{length}} number of items in this array</p>
    <slot></slot>
  </ul>
  `,
  props: ['length']
};

const App = {
  template: `
    <parent-list :length="list.legnth">
	  <li v-for="i in list">Item {{i}}</li>
    </parent-list>
  `,
  components: {
    ParentList,
  },
  data() {
  	return {
  		list: [1, 2, 3]
  	}
  }
};
```

While this works, it's obnoxious that we have to reference `list` in more than one component template at a time. Currently, we're using `list` in both our `App` template as well as our `ParentList` template.

Luckily, we can utilize `slot` to pass data to a `template` via a `v-slot` attribute:

```javascript
const ParentList = {
  template: `
  <p>There are {{list.length}} number of items in this array</p>
  <ul id="parentList">
    <slot v-for="(item, i) in list" :item="item" :i="i"></slot>
  </ul>
  `,
  props: ['list'],
};

const App = {
  template: `
    <parent-list :list="list">
      <template v-slot="props">
        <li>{{props.i}} {{props.item}}</li>
      </template>
    </parent-list>
    <button @click="addOne()">Add</button>
  `,
  data() {
    return {
      list: [1, 42, 13],
    };
  },
  methods: {
    addOne() {
      const randomNum = Math.floor(Math.random() * 100);
      this.list.push(randomNum);
    },
  },
  components: {
    ParentList,
  },
};
```

This `v-slot` is similar to how you might pass properties to a component, but instead we're passing data directly to a `template` to be rendered by `v-slot`.

> You can [object destructure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) the `v-slot` usage to gain access to the property names without having to repeat `props` each time:
>
> ```html
> <template v-slot="{item, i}">
> 	<li>{{i}} {{item}}</li>
> </template>
> ```

<!-- tabs:end -->













-------------------

// TODO:

- `this.$slots` / Vue (only for conditionally rendering)
