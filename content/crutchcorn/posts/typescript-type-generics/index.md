---
{
	title: "TypeScript Intermediates - Type Generics",
	description: 'An introduction to the type generic functionality in TypeScript',
	published: '2019-09-26T05:12:03.284Z',
	tags: ['typescript'],
	license: 'cc-by-nc-sa-4'
}
---

> **Note:**
> If you're not yet familiar with TypeScript, we have an introductory article you should read!
>
> 📝 [**Introduction to TypeScript**](/posts/introduction-to-typescript)

While working in various projects, you may come across a weird looking syntax in the codebase: `<>`. No no, not JSX, we're of course talking about type generics. They'll appear next to function calls (`callFn<T>()`), TypeScript types (`Array<any>`), and more.

_Type generics are a way to handle abstract types in your function._ **They act as a variable for types in that they contain information about the way your types will function.** They're very powerful in their own right, and their usage is not just restricted to TypeScript. You'll see many of these concepts applied under very similar terminologies in various languages. Enough on that, however. Let's dive into how to use them! 🏊‍

# The Problem {#generic-usecase-setup}

Type generics — on the highest level — _allow you to accept arbitrary data instead of strict typing, making it possible to broaden a type's scope_.

For example, what if you wanted to make a function that took an argument of `returnProp` and returned the `returnProp` value itself ([the formal name for a function like this is an **identity function**](https://en.wikipedia.org/wiki/Identity_function))? Without type generics, providing a typing for a function like this could be difficult.

Take the following implementation and consider its limitations:

```typescript
function returnProp(returnProp: string): string {
	return returnProp;
}

returnProp('Test'); // ✅ This is fine
returnProp(4); // ❌ This would fail as `4` is not a string
```

In this case, we want to make sure that every possible input type is available for the prop type. Let's take a look at a few potential solutions, with their various pros and cons, and see if we can find a solution that fits the requirements for providing typing for a function like this.

## Potential Solution 1: Unions {#generic-usecase-setup-union-solution}

One potential solution to this problem might be TypeScript unions. _Unions allow us to define an `or` condition of sorts for our types_. As we want to allow various types for inputs and outputs, perhaps that can help us here!

Using this method, if we wanted to accept numbers, we could add that as a union:

```typescript
function returnProp(returnProp: string | number): string | number {
	return returnProp;
}

returnProp('Test'); // ✅ This is fine
const shouldBeNumber = returnProp(4); // ✅ This won't show errors now
```

However, unions have some limitations. You'll find that this doesn't give the example you might want:

```typescript
// ❌ This will yield an error
// > Operator '+' cannot be applied to types '4' and 'string | number'.
const newNumber = shouldBeNumber + 4;
```

The reason that the operation `shouldBeNumber + 4` yields this error is because you've told TypeScript that `shouldBeNumber` is either a number **or** a string by making the output explicitly typed as a union. As a result, TypeScript is unable to do addition between a number and a string (which is one of the potential values) and therefore throws an error.

### Potential Solutions Disclaimer {#silly-examples-disclaimer}

> Author's note:
>
> If you were using unions in your property definitions and left your return type blank, TypeScript would be able to infer what the return type should be just fine.
>
> That said, we're trying to build on concepts, so we're trying to provide some examples of where this might be used and what it does. There are also instances, such as type definition files, where this inference might not be available to an author of typings, as well as other limitations with this method that we'll see later.

## Potential Solution 2: Function Overloading {#generic-usecase-setup-overloading-solution}

In order to get around the issues with explicitly returning a union, you _COULD_ utilize function overloading to provide the proper return typings:

```typescript
function returnProp(returnProp: number): number;
function returnProp(returnProp: string): string;
// While this seems repetitive, TS requires it.
// Otherwise, it will complain:
// This overload signature is not compatible with its implementation signature.
function returnProp(returnProp: string | number): string | number {
	return returnProp;
}
```

That said, in addition to having some obnoxious duplicated type information, this method also has its limitations.

For example, if we wanted to pass in an object of some kind (such as `{}`, a simple empty object), it would be invalid:

```typescript
returnProp({}) // Argument of type '{}' is not assignable to parameter of type 'string'.
```

This may seem obvious from the typings, but _we ideally want `returnProp` to accept ANY type because **we aren't using any operations that require knowing the type**._ (no addition or subtraction, requiring a number; no string concatenation that might restrict an object from being passed).

## Potential Solution 3: Any {#generic-usecase-setup-any-solution}

Of course, we could use the `any` type to force any input and return type. (Goodness knows I've had my fair share of typing frustrations that ended with a few `any`s in my codebase!)

Although this would allow any input type, we'd also be losing any type information between the input and output. As a result our types would be too loose on the return type:

```typescript
function returnSelf(returnProp: any): any {
	return returnProp;
}

const returnedObject = returnSelf({objProperty: 12}); // This now works! 🎉

returnedObject.test(); // This will not return an error but should 🙁
returnedObject.objProperty; // This will also (correctly) not throw an error, but TS won't know it's a number ☹️
```

<!-- ::in-content-ad title="Consider supporting" body="Donating any amount will help towards further development of articles like this." button-text="Visit our Open Collective" button-href="https://opencollective.com/playfulprogramming" -->

# The Real Solution {#generics-intro}

So what's the answer? How can we get preserved type data on both the input and the output??

The solution is... Well, you've read the title I'm sure.

_Type generics allow us to store loose type data in a **type variable**_. A type variable is _a unique kind of variable that's not exposed to JavaScript but is instead handled by TypeScript to provide expected typing data_. For example, the above example could be rewritten as:

```typescript
function returnSelf<T>(returnProp: T): T {
	return returnProp;
}
```

In this example, we're defining a type variable `T`, then telling TS that both the property and the return type should be the same type.

This means that you can use the function like this:

```typescript
const numberVar = returnSelf(2); // T in this instance is `2`, so it's similar to writing `const numberVal: 2 = 2;`

// Likewise, this object is now returned as if it was just placed on the const
const returnedObject = returnSelf({objProperty: 12});

// This will fail, as expected
returnedObject.test();
// This will exist, and TS will know it as a number
returnedObject.objProperty;
```

> Author's note:
>
> The type variable does not need to be called `T`. In fact, while it seems to be commonplace for the community to use single-letter type variable names (often due to the length and complexity of the typings), there are many reasons why more explicit type names should be used.
>
> Remember, type variables are like other variables in that you need to maintain them and understand what they're doing in your code.

# Okay, but Why? {#logger-example}

Why might we want to do this? [Returning an item as itself in an identity function](#generic-usecase-setup) is cool, but it's not very useful in its current state. That said, there **are** many, many uses for generics in real-world codebases.

For example, let's say that we had the following JavaScript code that we wanted to use as a logger:

```javascript
const util = require('util'),
	fs = require('fs');

// Have the `writeFile` return a promise instead of having to use a callback
const writeFileAsync = util.promisify(fs.writeFile);

/**
 * Async functions allows us to use `await` on promises in the function body, try/catch them, and
 * will return their own promise wrapped around the `return` value
 */
async function logTheValue(item) {
	const jsonString = JSON.stringify(item, null, 2);

	let err = undefined;

	try {
		// Attempt to write a new log file. If this fails, save the error to the `err` variable
		await writeFileAsync(`/logs/${Date.now()}`, jsonString);
	// Catch any errors and keep them as the `e` variable to assign to `err` later
	} catch (e) {
		err = e;
	}

	return {
		loggedValue: jsonString,
		original: item,
		// If there was no error, return `undefined` here
		err: err
	}
}
```

If we wanted to type the `logTheValue` function, we'd want to make sure to use a type generic for the input parameter `item`. By doing so, we could use that same generic for the return prop of `loggedValue` to ensure they both have the same typing. To do this, we could do so inline:

```typescript
// Because this is an `async` function, we want to wrap the returned type value in a Promise
async function logTheValue<ItemT>(item: ItemT): Promise<{loggedValue: string, original: ItemT, err: Error | undefined}> {
	// ... Function body here
}
```

Alternatively, we could utilize another feature of generics — the ability to pass the type value of the generic manually — and make an interface with a generic and do so there:

```typescript
interface LogTheValueReturnType<originalT> {
	loggedValue: string;
	original: originalT;
	err: Error | undefined;
}

// Notice how we're even wrapping that interface in a built-in type with a generic argument for `Promise`!
async function logTheValue<ItemT>(item: ItemT): Promise<LogTheValueReturnType<ItemT>> {
	// ... Function body here
}
```

With these few features, we're able to utilize much of the functionality of generics. 

However, I know I haven't answered what the `<>` really is for. Well, much like type variables, there's also the ability to pass types as "type arguments" when generics are applied to a function.

An example of this would be a syntax like this:

```typescript
logTheValue<number>(3);
```

# Non-Function Generics {#non-function-generics}

As you saw before with the `LogTheValueReturnType` interface — functions aren't the only ones with generics. In addition to using them within functions and interfaces, you can also use them in classes. 

Classes with generics can be particularly helpful for data structures like this:

```typescript
// DataType might want to be a base64 encoded string, a buffer, or an IntArray
class ImageType<DataType> {
	data: DataType;
	height: number;
	width: number;

	constructor(data: DataType, height: number, width: number) {
		this.data = data;
		this.height = height;
		this.width = width
	};
}

function handleImageBuffer(img: ImageType<Buffer>) {}
```

Type generics in classes can be used as method argument and property types alike.

There's also the ability to use generics within `type` definitions:

```typescript
interface ImageType<DataType> {
	data: DataType;
	height: number;
	width: number;	
}

interface ImageConvertMethods<DataType> {
	// This is the typing of a method. It will take a prop of the generic type and return the generic type
	toPNG: (data: DataType) => DataType;
	toJPG: (data: DataType) => DataType;
}


type ImageTypeWithConvertMethods<DataType> = ImageType<DataType> & ImageConvertMethods<DataType>
```

# Okay, but why-_er_? {#polymorphic-functions}

My my, you don't seem to take my word for it when I tell you that type generics are useful. That's alright, I suppose; After all, doubt while learning can lead to some great questions! 😉

Type generics enable us to do things like provide typings for **polymorphic functions**. _Polymorphic functions are functions that can accept a myriad of different types and handle them differently._

> Polymorphic functions are not unique to TypeScript; the things learned here about polymorphic functions can be applied to other languages as well. They also provide some real-world insight into the usages of generics and when they could be used.

For example, let's take a look at the code for the `toPNG`:

```typescript
function toPNG(data: DataType): DataType {
	if (Buffer.isBuffer(data)) {
		return convertBufferToPNG(data);
	} else if (Array.isArray(data)) {
		const imgBuffer = Buffer.from(data);
		const pngBuffer = convertBufferToPNG(imgBuffer);		
		return Buffer.from(pngBuffer);
	// base64 encoded string
	} else if (typeof data === 'string') {
		const imgBuffer = getBufferFromBaseStr(data);
		const pngBuffer = convertBufferToPNG(imgBuffer);
		return bufferToBase64(pngBuffer);	
	} else {
		throw 'toPNG only accepts arrays, buffers, or strings'
	}
}
```

Even though this function accepts various data types, it handles them differently under the hood! Functions that have this type of "accept many, handle each slightly differently" behavior are called **Polymorphic Functions**. They're particularly useful in utility libraries.

# Restricting The Types {#extends-keyword}

Unfortunately, there's a problem with the above code: we don't know what type `DataType` is. Why does that matter? Well, if it's not a string, a Buffer, or an Array-like, it will throw an error! That's certainly not behavior to run into at runtime.

Let's fix that typing:

```typescript
function toPNG<DataType extends (string | Array<number> | Buffer)>(data: DataType): DataType {
	// ...
}
```

In this example _we're using the `extends` keyword to enforce some level of type restriction in the otherwise broad definition of a type generic_. We're using a TypeScript union to say that it can be any one of those types, and we're still able to set the value to the type variable `DataType`.

## Broaden Your Horizons {#imperative-casting-extends}

We're also able to keep that type restriction broad within itself. Let's say we had a function that only cared if an object had a specific property on it:

```typescript
interface TimestampReturn<T> {
	isPast: boolean;
	isFuture: boolean;
	obj: T
}
const checkTimeStamp = <T extends {time: Date}>(obj: T): TimestampReturn<T> => {
	let returnVal: TimestampReturn<T> = {
		isPast: false,
		isFuture: false,
		obj
	}
	
	if (obj.time < Date.now()) {
		returnVal.isPast = true;
	} else {
		returnVal.isFuture = true;
	}
	
	return returnVal;
}

```

In this case, we can rely on implicit type casting to ensure that we're able to pass `{time: new Date()}` but not `{}` as values for `obj`.

# Conclusion

And that's all I have for generics! Their usages are far and wide, and now you're able to apply your knowledge in code! We're hoping to have more posts on TypeScript soon - both more introductory and advanced. 

Questions? Feedback? Sound off in the comments below; we'd love to hear from you!
