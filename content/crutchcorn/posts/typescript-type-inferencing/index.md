---
{
    title: "The Rules of TypeScript Type Inferrencing",
    description: "",
    published: '2025-01-14T21:52:59.284Z',
    tags: ['typescript', 'webdev'],
    license: 'cc-by-4'
}
---

When it comes to elegant TypeScript usage, _inferencing_ is the name of the game. Take two of the following code samples:

```typescript
interface User {
  id: number;
  firstName: string;
  lastName: string;
  // ...
}

// One
function getExplicitUserName(user: User):
	`${Pick<User, "firstName">}${Pick<User, "firstName">}`
{
  return `${user.firstName} ${user.lastName}`;
}

/* vs */

// Two
function getImplicitUserName(user: User) {
	return `${user.firstName} ${user.lastName}`;  
}
```

In the first code sample, we're explicitly using `Pick` to find the type of `firstName` and `lastName` in order to explicitly type `getExplicitUserName`.

In the second code sample, we're implicitly allowing TypeScript to infer the value of `user.firstName` and `user.lastName`.

These two code samples are the same in the eyes of the TypeScript compiler after the implicit values are resolved.

Given this easier readability of `getImplicitUserName`, it's clear why many TypeScript pros suggest and encourage you to allow TypeScript to infer as much information as you can.

Unfortunately, the rules surrounding TypeScript's inferencing can be nuanced and hard to follow, especially in sufficiently complex TypeScript codebases.

Let's explore the how and why behind advanced type inferencing patterns.

# TypeScript 5.5

Now, if you return this:

```
```

// Talk about `x is string` type inferencing
