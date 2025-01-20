---
{
  title: "Compile time quick-sort using C++ variadic templates",
  published: "2011-09-23",
  edited: "2024-12-12",
  tags: ['cpp']}
---

> *This article is outdated!:*
> This article was written a very long time ago, and its contents no longer apply.
>
> Read the newer version [**by clicking here**](/posts/constexpr-quicksort-in-c17).

C++ is a strange language. In many ways it's a terrible language, but it's a very fun terrible language. It's also a very powerful one — especially its templates. Now that ISO C++ 2011 has brought variadic templates, it becomes easier to use and requires less typing.

# Exploring variadic templates

I decided to go into variadic templates, and I thought one way of exploring it was to express a compile-time quick-sort. Note that I didn't set out to find out if it could be done — that I was certain of - but to know whether I could do it, and I very specifically decided not to check what others had done as I had no illusions of being the first.

The first problem to solve was that of expressing a list of numbers.

```cpp
template <typename T, T... elems>
struct list;
```

That's all that is required. The second template parameter is a list of zero or more elements of type `T`. That's
what `...` denotes.

Its use is simple:

```cpp
typedef list<int, 3, 8, 69, 2> integers;
typedef list<char, 'c', 'h', 'a', 'r', 's', '\n'> word;
```

The fact that the template is only declared, but not defined, is not a mistake. It's not a problem that the types are incomplete and
can't be instantiated. Instantiated objects are a runtime thing, and this is about compile time computation.

It is, however, a good idea to be able to show what a list of numbers looks like, so a function to print the list is
handy. More handy is a mechanism to call a function for every value in the list, in order.

## Specializations

Specializing function templates is still a no-go, but the classic forwarding to a helper class works.

```cpp
template <typename T>
struct foreach_t;
```

This just introduces the helper class template. All work is done in the specializations.

```cpp
template <typename T, T head, T... tail>
struct foreach_t<list<T, head, tail...> >
{
  template <typename F>
  static void apply(F f)
  {
    f(head);
    foreach_t<list<T, tail...> >::apply(f);
  }
}; 
template <typename T>
struct foreach_t<list<T> >
{
  template <typename F>
  static void apply(F)
  {
  }
};
```

The first specialization calls the function provided in the `apply` member function to the first element of the list,
and then recurses to do the same with the tail of the list. The second specialization ends the recursion by handling an
empty list.

> Ah, the memories. At this time of the year, in 1989, I was in university and took my first academic programming course - "Functional Programming with Standard ML."
> I thought I had a good idea about programming, but boy, was I wrong.
> Who would've known that I'd find that course useful for C++ 22 years later? The programming technique is the same.
> The syntax is far worse in C++, though.

As a convenience, a function template is added:

```cpp
template <typename T, typename F>
void foreach(F f = F())
{
  foreach_t<T>::apply(f);
}
```

The default parameter is just so that the function can either be called with an object, or using a type
that is instantiated. It's just convenient. A small test program shows why.

```cpp
#include <iostream>
#include <ostream>
#include <cstdio> 
struct print
{
  template <typename T>
  void operator()(T t)
  {
    std::cout << t << ' ';
  }
}; 
int main()
{
  typedef list<int, 3, 8, 69, 2> integers;
  typedef list<char, 'c', 'h', 'a', 'r', 's', '\n'> word;
  foreach<integers, print>();
  std::cout << '\n';
  foreach<word>(std::putchar);
}
```

The output when run is:

```
3 8 69 2
chars
```

Not very exciting, I admit, but it shows that the list works and that traversing it works. In all test programs to
follow, the `print` struct is presumed available.

---

# Setup

In order to implement a quick sort on the lists, two things must be possible to do with them, partitioning and
concatenating them.

First the concatenation, since it's the easier operation.

```cpp
template <typename ...T>
struct concat;
```

As before, the generic `concat` template just introduces the name for the specializations.

```cpp
template <typename T, T... p1, T... p2, typename ...Tail>
struct concat<list<T, p1...>, list<T, p2...>, Tail... >
{
  typedef list<T, p1..., p2...> first_two;
  typedef typename concat<first_two, Tail...>::type type;
}; 
template <typename T, T... elems>
struct concat<list<T, elems...> >
{
  typedef list<T, elems...> type;
};
```

You may notice there's a local `typedef:`s galore in template meta programming, otherwise the lines becomes way too long to see properly.

The recursion is the same pattern, but here it is all about creating new types.

Another simple program shows its usage:

```cpp
int main()
{
  typedef list<int, 2, 4, 8> first;
  typedef list<int, 3, 5, 7> second;
  foreach<concat<first, second>::type, print>();
  std::cout << '\n';
}
```

The output of the code is the following:

```
2 4 8 3 5 7 
```

It seems to work. Good.

Partitioning a list is possible to do with one template, but the code becomes messy to read. This is about learning a
technique, not about managing messy code, so I decided to go for filtering instead. Less efficient, but much easier to
read and understand.

The filter template solution takes a predicate and a list. The predicate picks the elements to keep. Doing this first
requires a simple helper; the `if_else` template. I was pretty certain that this one made it to the standard library,
but perhaps I was wrong. At least I can't find it.

```cpp
template <bool b, typename T, typename F>
struct if_else
{
  typedef T type;
}; 
template <typename T, typename F>
struct if_else<false, T, F>
{
  typedef F type;
};
```

It's not very complicated. The template accepts a boolean value and two types. The typedef is the first type when the
boolean value is true, and the second type otherwise.

## Filtering

With this, the filter template is reasonably straight forward as it follows a by now familiar pattern.

```cpp
template <template <typename U, U> class Pred,
          typename Data>
struct filter; 
template <template <typename U, U> class Pred,
          typename T, T head, T... tail>
struct filter<Pred, list<T, head, tail...> >
{
  typedef list<T, tail...> tlist;
  typedef typename filter<Pred, tlist>::type ftail;
  typedef list<T, head> h;
  typedef typename if_else<Pred<T, head>::value,
                           typename concat<h, ftail>::type,
                           ftail>::type type;
}; 
template <template <typename U, U> class Pred, typename T>
struct filter<Pred, list<T> >
{
  typedef list<T> type;
};
```

The predicate is a template that provides a boolean value given a type and an input value. The filter template recurses
over the elements of the list, and uses `if_else` to select either only the tail, or the selected value concatenated
with the tail.

A simple program demonstrates this behavior.

```cpp
template <typename T, T t>
struct is_odd
{
  static const bool value = t & T(1);
}; 
int main()
{
  typedef list<int, 8, 9, 2, 1, 0, 23, 11, 23, 3, 512 > data;
  foreach<filter<is_odd, data>::type, print>();
  std::cout << '\n';
}
```

The output is:

```
9 1 23 11 23 3 
```

It seems like the filtering works.

Quick sort is now only about picking a pivot element, and filtering the elements from the list that are smaller and
those that aren't into separate lists, quick sort the lists and concatenate the results.

To be generic, though, the sort order should be defined by a comparison template. A reasonable comparison template is:

```cpp
template <typename T, T l, T r>
struct lt
{
  static const bool value = l < r;
};
```

Using a selected pivot value, this comparison template must be transformed into a predicate that the `filter` template
can use. Inspired by the `std::bind` functions from the standard library, here is a `bind` template that provides the
needed transformation.

```cpp
template <template <typename U, U, U> class C,
          typename T, T t>
struct bind
{
  template <typename V, V v>
  struct pred
  {
    static const bool value = C<T, v, t>::value;
  };
};
```

The template parameter `C` is the comparison template, and the member template `pred` is the resulting predicate.

It can be used like this:

```cpp
int main()
{
  typedef list<int, 8, 9, 2, 1, 0, 23, 11, 23, 3, 512 > data;
  typedef filter<bind<lt, int, 10>::pred, data>::type lt10;
  foreach<lt10, print>();
  std::cout << '\n';
}
```

The output is:

```
8 9 2 1 0 3 
```

Presumably, it works.

Now, for the quick sort, both the set selected by the predicate, and its complement, must be available. A simple way to
get the complement is to negate the predicate.

Enter another helper template.

```cpp
template <template <typename U, U> class Pred>
struct neg
{
  template <typename T, T v>
  struct pred
  {
    static const bool value = !Pred<T, v>::value;
  };
};
```

The template parameter `Pred` is the predicate to negate, and the member template `pred`, is the negated predicate to use.

A simple variation of the previous example program is:

```cpp
int main()
{
  typedef list<int, 8, 9, 2, 1, 0, 23, 11, 23, 3, 512 > data;
  typedef filter<neg<bind<lt, int, 10>::pred>::pred,
                 data>::type ge10;
  foreach<ge10, print>();
  std::cout << '\n';
}
```

Unsurprisingly, the output is:

```
23 11 23 512 
```

---

# Quick-sorting

Now, finally, all the bits and pieces are there. It's just a matter of assembling them to a quick sort template

```cpp
template <template <typename T, T, T> class Comp,
          typename Data>
struct q_sort; 
template <template <typename U, U, U> class Comp,
          typename T, T head, T... tail>
struct q_sort<Comp, list<T, head, tail...> >
{
  template <typename V, V v>
  struct pred : bind<Comp, V, v>::template pred<T, head> {};
  template <typename V, V v>
  struct npred : neg<pred>::template pred<V, v> {};
  typedef typename filter<npred, list<T, tail...> >::type fl;
  typedef typename filter< pred, list<T, tail...> >::type tl;
  typedef typename q_sort<Comp, fl>::type sfl;
  typedef typename q_sort<Comp, tl>::type stl;
  typedef list<T, head> hl;
  typedef typename concat<sfl, hl, stl>::type type;
}; 
template <template <typename U, U, U> class Pred,
          typename T>
struct q_sort<Pred, list<T> >
{
  typedef list<T> type;
};
```

The middle template that does all the work is a bit overwhelming, but it's not as bad as it looks.

The `head` element is chosen as the pivot element.

First a predicate is made out of the `Comp` comparison template parameter, using the `bind` helper template introduced
earlier and the pivot element.

Next a negated predicate `npred` is made with the help of the `neg` helper template.

Using these two predicates, two new lists are made, `fl` for false, i.e. when the negated predicate picked the elements,
and `tl` for true, i.e. when the predicate picked the elements.

Then the two lists are sorted recursively, by creating two new types `sfl` and `stl` (for sorted versions of `fl`
and `tl`.)

The only thing that remains is to concatenate the lists and the pivot element into a resulting type.

The use is simple:

```cpp
int main()
{
  typedef list<int, 8, 9, 2, 1, 0, 23, 11, 23, 3, 512 > data;
  foreach<q_sort<lt, data>::type, print>();
  std::cout << '\n';
}
```

The resul is... *(drumroll)*:

```
0 1 2 3 8 9 11 23 23 512 
```

Quick sort in compile time using C++ variadic templates. *Now how useless is that?*

**Hope you enjoyed the show!**
