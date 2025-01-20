---
{
  title: "Compile time quick-sort in idiomatic modern C++",
  published: "2015-01-18",
  edited: "2024-12-12",
  tags: [ 'cpp' ]}
---

> *This article is outdated!:*
> This article was written a very long time ago, and its contents no longer apply.
>
> Read the newer version [**by clicking here**](/posts/constexpr-quicksort-in-c17).

A contender for the most useless program ever written just got a much needed overhaul. In
2011 [I wrote about compile time quick-sort](/posts/compile-time-quick-sort-using-c) as a challenge to myself, and as an
exercise in the then newfangled variadic templates. Now, having worked with C++11 for a few years, and lately also
C++14, I see that the code I wrote then is unnecessarily clumsy and highly unidiomatic.

In C++14 the data representation is
easy. [`std::integer_sequence<T, ts...>`](http://en.cppreference.com/w/cpp/utility/integer_sequence) fits perfectly. It
really is the same as I used in 2011, but this time it's provided by the standard library.

# Output

In order to show sequences, an output streaming operator is handy:

```cpp
template <typename T, T ... ts>
std::ostream& operator<<(std::ostream& os,
                         const std::integer_sequence<T, ts...>&)
{
  os << "{ ";
  static const T values[] { ts... };
  std::copy(std::begin(values),
            std::end(values),
            std::ostream_iterator<T>(os, " "));
  return os << "}";
}
```

Note that the value of the integer sequence is not used. All information is in the type. That's why filling the values
in a static array makes sense - the output stream operator function will be instantiated for each different sequence
being output by a program.

# Concatenating sequences

An important problem to solve is that of concatenating sequences. It will be needed in quick sort itself, since it
concatenates the sorted sub sequences.

First an introduction of the concat template, accompanied by an alias for making life easier.

```cpp
template <typename ... T>
struct concat;

template <typename ... T>
using concat_t = typename concat<T...>::type;
```

The alias `concat_t<T...>` is a convenience. Instead of having to write `using a = typename concat<T...>::type`, you
just write `using a = concat_t<T...>`.

In ways I dislike the naming convention (I'd like it reversed,) but it follows that of the C++14 standard library, and
that is not unimportant. Regardless, I argue that the latter is not just less typing, but is easier to read too.

Now for the partial specializations.

As so often in template meta programming, the solution is recursive. First concatenating a single integer sequence is
the trivial base case.

```cpp
template <typename T, T ... ts>
struct concat<std::integer_sequence<T, ts...> >
{
  using type = std::integer_sequence<T, ts...>;
};
```

In ways this is even unnecessarily complicated. You can say that concatenating one type (any type) is that type itself.
That would work, but I choose to make partial specializations for `std::integer_sequence<>` only, since it makes it
slightly easier to catch stupid programming mistakes. It also future proofs `concat`, should I ever feel a need to
concatenate other types.

The general case, concatenating two integer sequences, and some unknown tail is the same as concatenating the
combination of the two integer sequences with the tail.

```cpp
template <typename T, T... s1, T... s2, typename ... Tail>
struct concat<std::integer_sequence<T, s1...>,
              std::integer_sequence<T, s2...>,
              Tail...>
{
  using type = concat_t<std::integer_sequence<T, s1..., s2...>, Tail...>;
};
```

Note how the convenience alias `concat_t` is useful even in the implementation of `concat` itself.

Let's see if this works, using a simple program:

```cpp
int main()
{
  using s1 = std::integer_sequence<int, 1, 2, 3>;
  using s2 = std::integer_sequence<int, 4, 5, 6>;
  using s3 = std::integer_sequence<int, 7, 8, 9>;
  std::cout << concat_t<s1, s2, s3>{} << '\n';
}
```

Note that even though the output stream operator for `std::integer_sequence<>` doesn't use the value itself, a value is
none the less needed, so an instance is created.

The output of running the program is:

```
{ 1 2 3 4 5 6 7 8 9 }
```

...Which is good.

# Partitioning

Quick sort works by partitioning the sequence into a sequence of the values less than a selected pivot element, and the
rest, and then recursively sort those partitions. So partitioning a sequence into two sequences based on a predicate is
important.

Here too, the solution is a recursive. The base case of partitioning an empty sequence is trivial:

```cpp
template <template <typename V, V> class pred, typename T>
struct partition;

template <template <typename V, V> class pred, typename T>
struct partition<pred, std::integer_sequence<T>>
{
  using incl_type = std::integer_sequence<T>;
  using excl_type = std::integer_sequence<T>;
};
```

After all, the number of elements selected by the predicate from the empty sequence are none, and likewise for those
rejected by it.

The general case is not much more difficult:

```cpp
template <template <typename V, V> class pred, typename T, T t, T ... ts>
struct partition<pred, std::integer_sequence<T, t, ts...>>
{
  using incl = std::integer_sequence<T, t>;
  using excl = std::integer_sequence<T>;

  using tail = partition<pred, std::integer_sequence<T, ts...> >;

  static const bool outcome = pred<T, t>::value;
  using incl_type = concat_t<std::conditional_t<outcome, incl, excl>,
                             typename tail::incl_type>;
  using excl_type = concat_t<std::conditional_t<outcome, excl, incl>,
                             typename tail::excl_type>;
};
```

As always in C++ template meta programming, using alias names for things is a must to keep the code anywhere near
readable.

Above `tail` is the result of the partitioning of the rest of the
values. [`std::conditional_t<selector, TrueType, FalseType>`](http://en.cppreference.com/w/cpp/types/conditional)
results in either `TrueType` or `FalseType` depending on the boolean value of the selector.

If we assume that the outcome of the predicate on `t` (the first element in the sequence) is true, then `incl_type`
becomes the concatenation of `std::integer_sequence<T, t>` and `incl_type` from `tail`, otherwise it becomes the
concatenation of the empty sequence and `incl_type` from `tail`.

Since this implementation builds both the included sequence and the excluded sequence in parallel, the convention of a
convenience alias `partition_t<>` is of little use. It would be possible to make a filter template instead, that just
provides a sequence of selected elements, but then filtering would have to be done twice, the second time with the
inverted predicate, and even though we're in compile time computation, we care about performance and avoid two-pass
implementations if we can, right?

Let's see how this partitioning works, with another simple program:

```cpp
template <typename T, T v>
struct is_odd : std::integral_constant<bool, v & 1> {};

int main()
{
  using seq = std::integer_sequence<int, 1, 2, 3, 4, 5, 6>;
  using elems = partition<is_odd, seq>;
  std::cout << elems::incl_type{} << ' ' << elems::excl_type{} << '\n';
}
```

Lines 1-2 defines the simple predicate that tells if an integral value is odd. Line 7 partitions the provided sequence
into those selected by the predicate and those rejected by it.

The result of running the program is:

```
{ 1 3 5 } { 2 4 6 }
```

so again, it looks OK.

# Quick sort

Given the availability of `concat` and `partition`, `quicksort` becomes rather simple to implement. First the typical
introduction of the template:

```cpp
template <template <typename U, U, U> class compare, typename T>
struct quicksort;

template <template <typename U, U, U> class compare, typename T>
using quicksort_t = typename quicksort<compare, T>::type;
```

Since `quicksort` only has one result, the convenience alias `quicksort_t` becomes handy. `compare` is a binary
predicate accepting two values of a given type.

As so often, the base case is trivial.

```cpp
template <template <typename U, U, U> class compare, typename T>
struct quicksort<compare, std::integer_sequence<T>>
{
  using type = std::integer_sequence<T>;
};
```

After all, the result of sorting an empty sequence is always an empty sequence.

The general case, a partial specialization of `quicksort` with a binary predicate `compare` and
an `std::integer_sequence<>` of at least one element, is surprisingly simple too:

```cpp
template <template <typename U, U, U> class compare,
          typename T, T t, T ... ts>
struct quicksort<compare, std::integer_sequence<T, t, ts...>>
{
  template <typename V, V v>
  using pred = compare<V, v, t>;

  using partitions = partition<pred, std::integer_sequence<T, ts...>>;

  using incl_seq = typename partitions::incl_type;
  using excl_seq = typename partitions::excl_type;
  using type = concat_t<quicksort_t<compare, incl_seq>,
                        std::integer_sequence<T, t>,
                        quicksort_t<compare, excl_seq> >;
};
```

Lines 5-6 is an interesting template alias. It makes a unary predicate from the binary predicate `compare` and the first
element of the sequence, `t`. So, the first element becomes the pivot element to partition the rest of the elements
around, and partition requires a unary predicate as its selection criteria. As an example, if `compare` is "less than",
and the first element `t` is 8, then `pred` becomes "is less than 8".

Line 8 is where this partitioning is done.

Lines 10-11 are just short hand conveniences to make lines 12-14 readable.

Lines 12-14 are just as from the text book, the result of quick sort is the concatenation of quick sort on the partition
of elements included by the predicate, the pivot element, and the result of quick sort on the partition of elements
excluded by the predicate.

Another simple program shows the result:

```cpp
template <typename T, T lh, T rh>
struct less : std::integral_constant<bool, (lh < rh)> {};

int main()
{
  using seq = std::integer_sequence<int, 32, 8, 4, 1, 7, 3, 99, 101, 5>;
  std::cout << quicksort_t<less, seq>{} << '\n';
}
```

The output from running this program is unsurprisingly:

```
{ 1 3 4 5 7 8 32 99 101 }
```

# A word on performance

Everyone who has studied algorithms knows that it's poor practice to partition the elements around the first element for
quick sort, since it gives sorting an already sorted sequence O(n²) complexity. For any deterministic element selection,
there is a vulnerable family of sequences, so to protect against this, the selection of the pivot element for
partitioning should be random. Just two days ago, a solution to this was shown
by [Matt Bierner](http://mattbierner.com/) in his blog
post ["Compile Time Pseudo-Random Number Generator"](http://blog.mattbierner.com/stupid-template-tricks-compile-time-pseudo-random-number-generator/).
I leave it as an exercise for someone else to improve on the quick sort implementation.

# Wrap up

The readability of this code is vastly improved over the 2011 original, and its shorter too. Using alias templates does
not just save typing, but also removes the need for many transformation templates. Performance is also improved over the
2011 original, which used two pass partitioning using a filter.

The utter uselessness of compile time quicksort, however, is not threatened.
