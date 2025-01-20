---
{
  title: "Using constexpr quick-sort in C++17",
  published: "2017-06-03",
  edited: "2024-12-12",
  tags: [ 'cpp' ]}
---

So I've written about compile time quick-sort twice
before ([2011](/posts/compile-time-quick-sort-using-c)
and [2015](/posts/compile-time-quicksort-in-idiomatic),) but now with C++17's
upcoming support, I thought I'd try it again.

# Getting started

I'll be taking advantage
of [`std::integral_constant<type, value>`](http://en.cppreference.com/w/cpp/types/integral_constant) a lot. It has the
advantage that it encodes the value in the type directly, while still allowing arithmetics as if it was a constant of
the type. Unfortunately, it's rather a lot to write, so to save on typing, a
convenient [variable template](http://en.cppreference.com/w/cpp/language/variable_template) is introduced.

```cpp
template <auto N>
std::integral_constant<decltype(N), N> c;
```

This brings a convenient short hand notation `c<3U>` meaning an lvalue of
type `std::integral_constant<unsigned int, 3U>`.
Line 1 shows `template <auto>`, which is a very handy new feature in C++17 for non-type template parameters, where the
type is deduced.

You can see example usage in the [Compiler Explorer](https://godbolt.org/g/8Tbij6). (Thanks, [@mattgodbolt](https://twitter.com/mattgodbolt).)

## Setup

Before we can go on to sorting, we need a way to express a range to sort, and to operate on those ranges. In this example, I've used a simple `type_list` template:

```cpp
template <typename ... T>
struct type_list
{
    constexpr type_list(T...) {}
};
```

The constructor is there to take advantage of another new C++17
feature: [automatic template parameter deduction](http://en.cppreference.com/w/cpp/language/class_template_deduction).

It's possible to write `type_list{c<3>, c<8>}` to construct an instance of `type_list<std::integral_constant<int, 3>, std::integral_constant<int, 8>>`.

Here, (line 4 above) the actual values aren't used in the `type_list`, it's the types alone that are interesting. The values are just used to guide the compiler to deduce the types correctly. The same technique can be used in more conventional programming; for example, `std::pair{3, 'c'}` constructs a `std::pair<int, char>`
which holds the values `3` and `'c'`.

Now we need a few functions to operate on the type lists:

```cpp
template <typename T, typename ... Ts>
constexpr auto head(type_list<T, Ts...>)
{
    return T{};
}

template <typename T, typename ... Ts>
constexpr auto tail(type_list<T, Ts...>)
{
    return type_list{Ts{}...};
}

template <typename ... Ts, typename ... Us>
constexpr auto operator|(type_list<Ts...>, type_list<Us...>)
{
    return type_list{Ts{}..., Us{}...};
}
```

Both `tail()` and the concatenating `operator|()` use
the [automatic template parameter deduction](http://en.cppreference.com/w/cpp/language/class_template_deduction) to
construct the returned `type_list`. Here's a [compiler explorer](https://godbolt.org/g/WiZKsg) to play around a bit with
them.

Now comes the matter of partitioning a `type_list` into two lists based on comparison with a pivot element. The easiest
way to do this is a classic recursion:

```cpp
template <typename Compare, typename P, typename ... Ts>
constexpr auto partition(Compare compare, P pivot, type_list<Ts...> tl)
{
    if constexpr (sizeof...(Ts) == 0)
    {
        return std::pair(type_list{}, type_list{});
    }
    else
    {
        constexpr auto h = head(tl);
        constexpr auto r = partition(compare, pivot, tail(tl));
        if constexpr (compare(h, pivot))
        {
            return std::pair(type_list{h} | r.first, r.second);
        }
        else
        {
            return std::pair(r.first, type_list{h} | r.second);
        }
    }
}
```

[`if constexpr`](https://arne-mertz.de/2017/03/constexpr-additions-c17/) is a new C++17 construction - often referred to
as `constexpr-if` - that is a major blessing when doing template programming. Unlike an ordinary `if`
statement, `if constexpr` only generates code for the branch selected by the `constexpr` condition.

Above, the `else` branch doesn't compile for an empty `type_list<> tl`, so an ordinary `if` statement would give a
compilation error. In C++14 and earlier, it would be necessary to write two separate `partition` functions, one that
matches the empty list, and one for the general case.

So, given a compare function, a pivot value, and a `type_list<Ts...>`, the function `partition` returns a pair of type
lists. The first containing the Ts that are true for `compare(pivot, t)`, and the second containing the other Ts. The
compare function can be an ordinary lambda. In C++17, lambdas are `constexpr` (when possible).

Check out this [Compiler Explorer](https://godbolt.org/g/9FjEEF) to play with it.

# Quick-sorting

Now all the bits necessary for doing quick-sort are in place, and it's an almost embarrassingly simple textbook-style
recursive solution:

```cpp
template <typename Compare, typename ... T>
constexpr auto sort(type_list<T...> tl, Compare compare)
{
    if constexpr (sizeof...(T) == 0)
    {
        return type_list{};
    }
    else
    {
        constexpr auto pivot = head(tl);
        constexpr auto r = partition(compare, pivot, tail(tl));
        return sort(r.first, compare) | type_list{pivot} | sort(r.second, compare);
    }
}
```

Here's a [compiler explorer](https://godbolt.org/g/CXleCy) that converts the sorted `type_list<>` into a `std::array<>`,
just to visualise the data generated.

> You may notice that the optimisation level chosen is **-O0**, and yet no code is generated to produce the sorted array.

---

As before, the usefulness of this is very limited, but it is kind of cool, isn't it? 

**Hope you enjoyed the article!**

