---
{
  title: "Asserting compilation errors in C++",
  published: "2014-08-28",
  edited: "2024-12-12",
  tags: ['cpp']}
---

Sometimes when crafting an interface, we want to ensure that some illegal constructs lead to compilation errors. After
all, a good interface is easy to use correctly and difficult to get wrong, and what can be more difficult to get wrong
than something that doesn't compile?

We also know that "untested" is often "buggy", or at least we cannot be sure that it is "correct", and tests that aren't
automated tend to be forgotten. This, of course, means that even if you've carefully crafted an interface where some
construction is illegal and made some manual tests for it, some bug fix later might ruin it and no test will catch that
the illegal construct now compiles.

# Building traps

However, `namespace`s and `using` directives opens an opportunity. Below is the beginnings of a trap that catches
illegal calls to a function named `f`.

```cpp
int f(std::string); // function to trap abuse of

struct illegal;
namespace bait {
  illegal f(...);
}

using namespace bait;
f(3);   // calls bait::f
f("");  // calls ::f
```

With the aid of C++11's [`decltype specifier`](http://en.cppreference.com/w/cpp/language/decltype) we can catch the
resulting type of an expression at compile time, in this case getting the return type of a function call, without
actually making the call.

```cpp
decltype(f(3))  obj1; // illegal
decltype(f("")) obj2; // int
```

Note that `bait::f` is never implemented. All that is needed is the signature so that the compiler can find match the
arguments and get the return type.

With these two, the trap can be triggered at compile time using
C++11's [`static_assert`](http://en.cppreference.com/w/cpp/language/static_assert)
and [`std::is_same<T,U>`](http://en.cppreference.com/w/cpp/types/is_same)

```cpp
#include <type_traits>
static_assert(std::is_same<decltype(f(3)),illegal>::value,
              "compiles when it shouldn't");
```

The above compiles, since `f(3)` matches `bait::f`, and no code is generated. Changing to a match of `::f`, however:

```cpp
static_assert(std::is_same<decltype(f("")),illegal>::value,
              "compiles when it shouldn't");
```

Gives a compilation error. On clang++ 3.4.2 the message is:

```
fc.cpp:18:1: error: static_assert failed "compiles when it shouldn't"
static_assert(std::is_same<decltype(f("")), illegal>::value,
^             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
1 error generated.
```

And g++ 4.8.2 gives the message:

```
fc.cpp:18:1: error: static assertion failed: compiles when it shouldn't
 static_assert(std::is_same<decltype(f("")), illegal>::value,
 ^
```

The results seem reversed. A call that would cause compilation error compiles, and a call that would compile gives a
compilation error.

Now what if `f` is in a _`namespace`_? Things become marginally more cluttered, but the technique remains the same.
Putting the bait in an _`inline namespace`_ solves the problem.

```cpp
namespace ns {
  int f(std::string);
}


struct illegal;

namespace ns {
  inline namespace bait {
    illegal f(...);
  }
}
```

An `inline namespace` is a `namespace`, but a everything declared in it is visible in its surrounding `namespace`,
similar to the `using namespace` directive used earlier.

```cpp
ns::f(3);   // calls ns::bait::f
ns::f("");  // calls ns::f
```

The test thus becomes:

```cpp
static_assert(std::is_same<decltype(ns::f(3)),illegal>::value,
              "compiles when it shouldn't");
```

A macro can help with code readability:

```cpp
#define ASSERT_COMPILATION_ERROR(...) \
static_assert(std::is_same<decltype(__VA_ARGS__), \
                           illegal::type>::value, \
              #__VA_ARGS__ " compiles when it shouldn't")
```

Writing the test code as:

```cpp
ASSERT_COMPILATION_ERROR(ns::f(""));
```

Gives the (g++ 4.8.2) compilation error:

```
fc.cpp:20:3: error: static assertion failed: ns::f("")compiles when it shouldn't
   static_assert(std::is_same<decltype(__VA_ARGS__), illegal>::value, 
   ^
fc.cpp:23:1: note: in expansion of macro ‘ASSERT_COMPILATION_ERROR’
 ASSERT_COMPILATION_ERROR(ns::f(""));
 ^
```

I think this is pretty neat. It is now simple to test that illegal calls actually don't compile. You can add these tests
to the unit test program that asserts the intended functionality.
