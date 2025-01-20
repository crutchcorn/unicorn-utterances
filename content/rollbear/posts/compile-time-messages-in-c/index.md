---
{
  title: "Compile time messages in C++",
  published: "2011-09-28",
  edited: "2024-12-12",
  tags: ['cpp']}
---

> *This article is outdated!:*
> This article was written a very long time ago, and its contents no longer apply.
>
> Read the newer version [**by clicking here**](/posts/constexpr-quicksort-in-c17).

At times, it's desirable to give a message at compile time. Sounds cheesy, eh? Well, read on and find out.

As an example of the cheesy kind, the compile-time quick sort shown
here [**earlier**](./compile-time-quick-sort-using-c) contained an
unnecessary run time element with a `main()` function, `for_each()` and a `print` template. It is possible to display
all
information at compile time by causing a compiler error, like this:

```cpp
template <typename T>
struct print;
```

Use it by, for example, referring to a member type.

Let's revisit the `list` and `concat` templates.

```cpp
template <typename T, T... elems>
struct list;
template <typename ...T>
struct concat; 
template <typename T, T... lh, T... rh, typename ...U>
struct concat<list<T, lh...>, list<T, rh...>, U...>
{
  typedef typename concat<U..., list<T, lh..., rh...> >::type type;
}; 
template <typename T, T... elems>
struct concat<list<T, elems...> >
{
  typedef list<T, elems...> type;
};
```

Now a simple test of how it works

```cpp
typedef print<concat<list<int, 1, 2>, list<int, 3, 4> >::type>::type message; 
```

The output from the compiler is:

```
c.cpp:72:9: error: 'type' in class 'print<list<int, 1, 2, 3, 4> >' does not name a type
```

Not perfect, but but it does show the resulting type `list<int, 1, 2, 3, 4>`.

Well, there is a caveat. The standard mandates very little indeed regarding error messages. The typical phrase used
is "... a diagnostic is required". Nothing at all is said about the information in that diagnostic, and a compiler
simply saying "?" can be fully standards compliant. Fortunately compiler writers likes happy users, and so usually try
to help them with informative messages, so this usually works fine, just no guarantees.

Note that the technique is perfectly usable in C++ as defined by the 1998 standard. The only reason I used the C++ 2011
feature, variadic templates here, is to save space.

As shown so far, this is just silly, but this can actually come in handy. How about some unit tests for the concat
template?

First a helper template:

```cpp
template <typename T, typename U>
struct assert_same_type; 
template <typename T>
struct assert_same_type<T, T>
{
  typedef T type;
};
```

The idea is that if the two parameter types are the same, the member `type` can be used in, for example a typedef,
otherwise the compiler will emit an error message.

Now let's put `concat` through its pace:

```cpp
typedef assert_same_type<concat<list<int> >::type,
                         list<int> >::type
concat_empty_list; 
typedef assert_same_type<concat<list<int, 1, 2> >::type,
                         list<int, 1, 2> >::type
concat_one_list; 
typedef assert_same_type<concat<list<int, 1, 2>,
                                list<int, 3, 4> >::type,
                         list<int, 1, 2, 3, 4> >::type
concat_two_lists; 
typedef assert_same_type<concat<list<int, 1>,
                                list<int, 2>,
                                list<int, 3> >::type,
                         list<int, 1, 2, 3> >::type
concat_three_lists;
```

The result of compilation is:

```
c.cpp:79:9: error: 'type' in class 'assert_same_type<list<int, 3, 1, 2>, list<int, 1, 2, 3> >' does not name a type
```

Whoaa! A bug! It seems that when three elements are concatenated, the order is changed. Hmm. Ah, look at `concat` above.
The error is rather obvious. Glad that one was caught before any library user came complaining.

Fixing the `concat` template to:

```cpp
template <typename T, T... lh, T... rh, typename ...U>
struct concat<list<T, lh...>, list<T, rh...>, U...>
{
  typedef typename concat<list<T, lh..., rh...>, U... >::type
  type;
};
```

Should take care of it. Another attempt at compiling gives silence. It works.

So, as can be seen, the technique can be rather useful. The error message given was, in this case, rather informative
and quickly pointed us in the right direction to fix the bug.

What about giving library users a little help, though? `concat` can only be used with `list` type parameters. Anything
else
is an error. What does the compiler emit when `concat` is used with mismatching types? Let's put it to the test:

```cpp
typedef concat<list<int>, std::vector<std::string> >::type listvec;
```

The error message is:

```
c.cpp:69:9: error: 'type' in class 'concat<list<int>, std::vector<std::basic_string<char> > >' does not name a type
```

Not very helpful. The user will have to look at the sources for concat to understand what it means.

If you're lucky enough to write your programs with a compiler that supports `static_assert()`, officially introduced in
ISO C++ 2011, but supported by many compilers for some time ([gcc](http://gcc.gnu.org/) introduced it in
version [4.3](http://gcc.gnu.org/projects/cxx0x.html) released in March 2008,) it's simple. `static_assert()` requires a
compile-time known boolean value and a string. The
string is the error message if the boolean is false.

So, with a simple helper, `concat` can provide a lot better information to the user.

```cpp
template <typename ...Tail>
struct all_elements_are_lists
{
  static const bool value = false;
};
template <typename T, T... elems, typename ... Tail>
struct all_elements_are_lists<list<T, elems...>,
                              Tail...>
{
  static const bool value = all_elements_are_lists<Tail...>::value;
};
template <typename T, T... elems>
struct all_elements_are_lists<list<T, elems...> >
{
  static const bool value = true;
};
template <typename ...T>
struct concat
{
  static_assert(all_elements_are_lists<T...>::value,
                "All parameters to concat must be lists.");
};
```

Let's try the faulty `concat` invocation again. Now the error message is:

```
c.cpp: In instantiation of 'concat<list<int>, std::vector<std::basic_string<char> > >':
c.cpp:79:53:   instantiated from here
c.cpp:38:3: error: static assertion failed: "All parameters to concat must be lists."
c.cpp:79:9: error: 'type' in class 'concat<list<int>, std::vector<std::basic_string<char> > >' does not name a type
```

It would be a lie to say that it's perfect, but the information is a lot clearer and the user does not have to read the
sources for `concat`, so it's an improvement.

So what to do if your compiler does not support `static_assert()`? All is not lost. Use the technique described in the
beginning of the post to create a type, or a template, with a descriptive name that causes an error. The descriptive
name will hopefully be shown in the error message. You may have to play around a bit to find a solution, but it's
doable, although the message will never be as clear as with `static_assert()`.

Compile time messages turned out to be pretty useful, I think.
