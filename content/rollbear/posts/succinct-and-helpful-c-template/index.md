---
{
  title: "Succinct and helpful C++ template compilation errors",
  published: "2016-05-18",
  edited: "2024-12-12",
  tags: [ 'cpp' ]}
---

We've all experienced them, the long and unhelpful compilation errors from templates, usually referring to some internal
header you didn't even know existed. Finding the source of the error can be painful, and not unusually the clue, if
there is any, is some where in the middle of the long list of messages.

Yes yes, [concepts](http://en.cppreference.com/w/cpp/language/constraints) are coming to
C++. [GCC 6](https://gcc.gnu.org/onlinedocs/gcc-6.1.0/gcc/) has them, and they are in
a [TS](http://cplusplus.github.io/concepts-ts/). Concepts can help get the error message to the source of the error, and
some times to give a good idea of why the error occurred.

This post will show one technique available from C++11 and later. It, and some variants of it, are used extensively in
the [Trompeloeil](https://github.com/rollbear/trompeloeil) C++14 mocking frame work to provide short compilation error
messages that explains to the user what went wrong.

In all fairness, this technique is not my invention, and unfortunately I've forgotten where I first learned of it. If
you know who pioneered it, please let me know so I can attribute it properly.

> Edit: [Shafik Yaghmour](https://apis.google.com/wm/1/102200829211519225794) directed me to discussions
> on [reddit](https://www.reddit.com/r/cpp/comments/4jybls/succinct_and_helpful_c_template_compilation_errors/) pointing
> to [Eric Niebler](http://ericniebler.com/) being the likely originator of this technique, first used in
> the [Boost](http://www.boost.org/)/[Proto](http://www.boost.org/doc/libs/1_61_0/doc/html/proto.html) library.

> Another edit: [Eric Niebler](http://ericniebler.com/) himself isn't entirely sure he pioneered the technique, but
> this [YouTube video](https://www.youtube.com/watch?v=JF6YM0XzHnE) makes it likely.

# Problem introduction

Here's a simple toy example. Imagine that everything except the `main()` function is a template library.

```cpp
#include <string>
#include <iostream>
#include <utility>

void internal_func(const std::string& s)
{
  std::cout << s << '\n';
}

template <typename ... T>
void do_with_string(T&& ... t)
{
  internal_func({std::forward<T>(t)...});
}

int main()
{
  do_with_string("foobar", 3U);
  do_with_string(std::string("bar"));
}
```

The function `do_with_string()` accepts any parameters that
a [`std::string`](http://en.cppreference.com/w/cpp/string/basic_string) can be constructed from. As long as it's used
correctly, it works nicely.

But when a programmer makes a mistake, things turn unpleasant:

```cpp
int main()
{
  do_with_string("foobar", 3U);
  do_with_string(std::string("bar"));
  do_with_string(3.1); // Error, can't make a string from a double
}
```

There's what clang++-3.8 says:

There are three huge problems here:

1. The highlighted problems refer to internal functions that, in a real world library, would likely be something that
   the user of the library never even knew existed.
2. The highlighted information doesn't say what failed. The complaint
   that `'double'` cannot be narrowed to `'char'` is true but nonsensical.
   The actual problem is that the entire parameter pack expansion cannot
   be used to construct a `std::string`, and that information is completely
   missing.
3. Even though the root location of the error is shown, the `do_with_string(3.1)` call, this information is in the
   middle. Again, in a real world template library this could be in the middle of hundreds of lines of disinformation.

g++-5.2 does ever so slightly better in this case, in that the failing call site is the first line of the error list,
but the rest of the problems are there for g++-5.2 as well.

# Using `static_assert()`

A popular method to give more information is to
use [`static_assert()`](http://en.cppreference.com/w/cpp/language/static_assert). With it you can provide a helpful error
message that gives the user an explanation.

```cpp
template <typename ... T>
void do_with_string(T&& ... t)
{
  constexpr auto legal = std::is_constructible<std::string, T&&...>{};
  static_assert(legal, "it must be possible to form a std::string from the args");
  internal_func({std::forward<T>(t)...});
}
```

On line 4, the constant `legal` becomes either [`std::true_type`](http://en.cppreference.com/w/cpp/types/integral_constant)
or `std::false_type` depending on
whether [`std::is_constructible<>`](http://en.cppreference.com/w/cpp/types/is_constructible) concludes
that [`std::string`](http://en.cppreference.com/w/cpp/string/basic_string) can be constructed from `T&&...` or not.

The `static_assert()` on line 5 causes a compilation error with the explicit error message string if `legal` is `false`.

The difficulty is figuring out methods to check whether the function can succeed or not. In this case it was relatively
easy.

Here's what clang++-3.8 says when the faulty `main()` is compiled:

```
t.cpp:14:3: error: static_assert failed "it must be possible to form a std::string from the args"
  static_assert(legal, "it must be possible to form a std::string from the args");
  ^             ~~~~~
t.cpp:22:3: note: in instantiation of function template specialization 'do_with_string<double>' requested here
  do_with_string(3.1); // Error, can't make a string from a double
  ^
t.cpp:15:18: error: type 'double' cannot be narrowed to 'char' in initializer list [-Wc++11-narrowing]
  internal_func({std::forward<T>(t)...});
                 ^~~~~~~~~~~~~~~~~~
t.cpp:22:3: note: in instantiation of function template specialization 'do_with_string<double>' requested here
  do_with_string(3.1); // Error, can't make a string from a double
  ^
t.cpp:15:18: note: insert an explicit cast to silence this issue
  internal_func({std::forward<T>(t)...});
                 ^~~~~~~~~~~~~~~~~~
                 static_cast<char>()
2 errors generated.
```

It is an improvement, but there is a lot of noise and disinformation. There is also the repetition of blaming the call
to `do_with_string(3.1)` twice for different offenses.

G++-5.2 is slightly better in that it doesn't try to give conflicting reasons for the failure, but the extra warnings
are misleading at best.

```
t.cpp: In instantiation of ‘void do_with_string(T&& ...) [with T = {double}]’:
t.cpp:22:21:   required from here
t.cpp:14:3: error: static assertion failed: it must be possible to form a std::string from the args
   static_assert(legal, "it must be possible to form a std::string from the args");
   ^
t.cpp:15:16: warning: narrowing conversion of ‘std::forward<double>((* & t#0))’ from ‘double’ to ‘char’ inside { } [-Wnarrowing]
   internal_func({std::forward<T>(t)...});
                ^
t.cpp:15:16: warning: narrowing conversion of ‘std::forward<double>((* & t#0))’ from ‘double’ to ‘char’ inside { } [-Wnarrowing]
```

Both compilers give the necessary helpful message, but there's a lot of unhelpful cruft. In a real world example, the
helpful message might be difficult to find among all the uninteresting ones.

The problem is that even though a `static_assert()` is triggered, the compiler continues to try to make sense out of the
function, and it fails to do so, and this causes the unhelpful extra messages.

The solution, as so often, is another level of indirection.

# Tag dispatch

The trick is to not call `internal_func()` directly from `do_with_string()`, but to use an indirection via a function
that takes an extra parameter saying whether the call can succeed or not. Since the flag `legal` is already of either
`std::true_type` or `std::false_type`, the indirection functions can be selected on those types. Note that it is really
the type that differs, not just different boolean values.

```cpp
template <typename ... T>
void do_with_string_(std::false_type, T&& ...);

template <typename ... T>
void do_with_string_(std::true_type, T&& ... t)
{
  internal_func({std::forward<T>(t)...});
}

template <typename ... T>
void do_with_string(T&& ... t)
{
  constexpr auto legal = std::is_constructible<std::string, T&&...>{};
  static_assert(legal, "it must be possible to form a std::string from the args");
  do_with_string_(legal, std::forward<T>(t)...);
}

```

The new indirection functions `do_with_string_()` on lines 1-2 and 4-8 are selected on the first parameter type, which
is provided from the call at line 15. Note that the failure function doesn't have to be implemented, just declared.

This removes the cruft.

clang++-3.8 says:

```
t.cpp:23:3: error: static_assert failed "it must be possible to form a std::string from the args"
  static_assert(legal, "it must be possible to form a std::string from the args");
  ^             ~~~~~
t.cpp:31:3: note: in instantiation of function template specialization 'do_with_string<double>' requested here
  do_with_string(3.1); // Error, can't make a string from a double
  ^
1 error generated.
```

Excellent!

G++-5.2 is equally helpful:

```
t.cpp: In instantiation of ‘void do_with_string(T&& ...) [with T = {double}]’:
t.cpp:31:21:   required from here
t.cpp:23:3: error: static assertion failed: it must be possible to form a std::string from the args
   static_assert(legal, "it must be possible to form a std::string from the args");
   ^
```

Both give the helpful message, and the source of the failing call, and not much else, and specifically no misleading
messages from internal functions that the user doesn't even know about.

# Wrap-up

Unfortunately I do not feel comfortable enough with concepts to show examples in a future C++, but perhaps someone else
can complement this post and write an alternative article from the viewpoint of a concepts world?
