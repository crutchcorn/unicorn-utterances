---
{
	title: "Mutable vs Immutable Data Types",
	description: "Using mutable data types can be dangerous in multi-threaded applications. To help that we can make sure of thread safer immutable data types",
	published: '2022-07-20T16:56:03.000Z',
	tags: ['typescript', 'computer science'],
	license: 'cc-by-nc-sa-4'
}
---


# Defining Mutable and Immutable

Mutable means "can change". Immutable means "cannot change". And these meanings  remain the same in the technology world. For example, a mutable string can be changed, and an immutable string cannot be changed.

It's important to note that this does not relate to a variable, but to a value. Constants are not always immutable, and non-constant variables are not always mutable.

For example, **objects in JavaScript are by default mutable**, even if they're assigned to a constant variable. The following is valid TypeScript:

```typescript
const myObj = {
    one: 1,
    two: 2
};
// Here myObj is { one: 1, two: 2 }

myObj.three = 3;
// Here myObj is { one: 1, two: 2, three: 3 }
```

The only thing you cannot do with a constant is reassign it, e.g:

```typescript
const myObj = {
    one: 1,
    two: 2
};
// Here myObj is { one: 1, two: 2 }

myObj = {
    one: "one",
    two: "two"
}
// Uncaught TypeError: Assignment to constant variable
```

And the same is the case with arrays.

> **Learn more about object mutability:**
> If you'd like to learn more about how mutability affects objects differently than other variables, we have an article for that!
>
> 📝 [**What is Object Mutation in JavaScript?**](/posts/object-mutation)

# What is the problem with mutable variables?

The biggest problem with mutable variables is that they are not thread-safe. Thread safe code is defined as: "Thread-safe code only manipulates shared data structures in a way that ensures that all threads behave properly and fulfill their design specifications without unintended interaction." (src: [Thread safety - Wikipedia](https://en.wikipedia.org/wiki/Thread_safety))

What this means is that threads can access a data structure without producing unexpected results.

Take this example from [Statics &amp; Thread Safety: Part I](https://odetocode.com/Articles/313.aspx) for instance: Say I've got a shopping cart with 10 items at my local shop. I go to checkout and the clerk grabs each item and puts it through the register and then computes my cost. Without human error, we would expect the correct total to be shown.

Now imagine if we had 5 checkout lanes, each one with one clerk, but only 1 shared register. If multiple clerks are putting in items through the register at the same time, no one would get their correct total.

The solution is to ensure that only 1 clerk will have access at any one time to the register (a lock), and no other clerks can use the register until my 10 items are scanned.

# How does immutability solve this issue?

Immutability solves this issue by ensuring that a data structure cannot be modified, only read. Create once, read many times. So what if you need to perform an operation on an immutable data structure? You'd return the result in a *new* immutable instance of the data structure.

So how does this look in typescript?

```typescript
class ImmutableUser {
    readonly name: string;
    readonly age: number;
    
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    increaseAgeByOne(): ImmutableUser {
        return new ImmutableUser(this.name, this.age + 1);
    }
}
```

Now whenever we want to perform an operation (in this case increase the age in the event of a birthday for example), we create a whole new instance of `ImmutableUser` instead of modifying the current instance. We've also marked `name` and `age` as `readonly` to make sure that the end user also isn't able to modify these variables.

Here is what it would look like to use an `ImmutableUser`

```typescript
let testUser = new ImmutableUser("John Doe", 19); // instance A

// Increase age
testUser = testUser.increaseAgeByOne(); // instance B
```

Now in the scenario that Thread 1 is reading `instance A` and Thread 2 wants to increase the age, it will have to do so by creating an `instance B` instead of directly modifying `instance A`, so it is assured that Thread 1 will produce expected behaviour.

Thanks for taking the time to read this article, and make sure to check other Unicorn Utterance's blog posts!

