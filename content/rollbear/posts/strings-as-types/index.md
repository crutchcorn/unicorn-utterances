---
{
  title: "Expressing strings as types",
  published: "2013-03-31",
  edited: "2024-12-12",
  tags: [ 'cpp' ]}
---

> *This article is outdated!:*
> This article was written a very long time ago, and its contents no longer apply.
>
> Read the newer version [**by clicking here**](/posts/strings-as-types-with-c17-constexpr).

As odd as it may seem, I have more than once felt the need to express a string literal as a unique type which can be
used as a any class.

As an example, I would like to inherit from a string literal:

```cpp
class C : public "literal"
{
  ...
};
```

C++11 sort of provides the means with the introduction
of [variadic templates](http://en.wikipedia.org/wiki/Variadic_template). Here's an introduction with a
simple `t_string` (for type string,) with easy access to the `size` and a c-string representation:

```cpp
template <char ...t>
struct t_string
{
  static const size = sizeof...(t);
  static const char c_str[size + 1];
};
template <char ...t>
const char t_string<t...>::c_str[t_string<t...>::size+1]={t...,0};
```

This can be used in a sample program like follows:

```cpp
int main()
{
  typedef t_string<'p', 'i', 'g'> P;
  std::cout << "P::c_str[" << P::size+1 << "]=" << P::c_str << '\n';
}
```

When run, the output is:

```shell
\> ./test1
P::c\_str\[4]=pig
```

While the above works, it is, at best, very cumbersome and not really a practical solution.

# `constexpr` and the preprocessor to the rescue!

I had pretty much given up on this and resolved to make do without strings as types, but then
this [blog post](http://cpp-next.com/archive/2012/10/using-strings-in-c-template-metaprograms/) by Abel Sinkovics and
Dave Abrahams pointed me in the right direction.

In C++11, a `constexpr` function is a function that not only can be evaluated at compile time, but which return value
can be used in constant expressions, for example as template parameters. For this problem, a useful function indexes a
char array:

```cpp
template <size_t N>
constexpr char at(size_t n, const char (&array)[N])
{
  static_assert(n < N, "index is out of bounds for the array");
  return array[n];
}
```

The `array` parameter can refer to any string literal. With this, the above example program can be written as:

```cpp
int main()
{
  typedef t_string<at(0, "pig"), at(1, "pig"), at(2, pig)> P;
  std::cout << "P::c_str[" << P::size+1 << "]=" << P::c_str << '\n';
}
```

This may not seem like an obvious improvement, but with a little help from our old friend, the preprocessor, things can
improve a lot.

```cpp
#define A_LIST_1(M, ...)                           M(0, __VA_ARGS__) 
#define A_LIST_2(M, ...) A_LIST_1(M, __VA_ARGS__), M(1, __VA_ARGS__)
#define A_LIST_3(M, ...) A_LIST_2(M, __VA_ARGS__), M(2, __VA_ARGS__)

#define INDEX(x, array) at(x, array) 

int main()
{
  typedef t_string<A_LIST_3(INDEX, "pig")> P;
  std::cout << "P::c_str[" << P::size + 1 << "]=" << P::c_str << '\n';
}
```

This expands to the same as the above program, which in turn expands to the same as the first sample program, making `P`
an alias for `t_string<'p', 'i', 'g'>`.

The problem with the above is having to use `A_LIST_3()` when the string literal is 3 characters long. This is error
prone.

# Generalizing on length

One thing that can be done to get around this is to use a sufficiently long list (for some measure of sufficient), and
change the `constexpr` function `at()` to return 0 for out of bounds indexes.

```cpp
template <size_t N>
constexpr char at(size_t n, const char (&array)[N])
{
  return n < N ? array[n] : 0;
}
```

Extending the `A_LIST_X` series to a reasonable value of "sufficient", we can now safely ignore the string length
problem:

```cpp
int main()
{
  typedef t_string<A_LIST_500(INDEX, "pig")> P;
  std::cout << "P::c_str[" << P::size + 1 << "]=" << P::c_str << '\n';
}
```

Well, there's this problem with size... Running this program shows:

```shell
\> ./test4
P::c\_str\[501]=pig
```

# Getting rid of those zeroes

Instead of adding characters to the type as a comma separated list, we can extend the `t_string` template with
an `append` function-like type template, that ignores `'\0'`.

```cpp
template <typename T>
struct append_t;

template <char ...t>
struct t_string
{
  template <char c>
  struct append
  {
    typedef typename append_t<c, t_string>::type type;
  };
  static const size = sizeof...(t);
  static const char c_str[size + 1];
};

template <char ...t>
const char t_string<t...>::c_str[t_string<t...>::size+1]={t...,0};

template <char c, char ...t>
struct append_t<c, t_string<t...>>
{
  typedef t_string<t..., c> type;
};

template <char ...t>
struct append_t<'\0', t_string<t...>>
{
  typedef t_string<t...> type;
};
```

This changes the syntax a bit, but a small modification of the first example program shows the way:

```cpp
int main()
{
  typedef t_string<>
          ::append<'p'>::type
          ::append<'i'>::type
          ::append<'g'>::type
          ::append<'0'>::type
          ::append<'0'>::type P;
  std::cout << "P::c_str[" << P::size+1 << "]=" << P::c_str << '\n';
}
```

The output from this program is:

```shell
\> ./test5
P::c\_str\[4]=pig
```

Obviously the trailing zeroes were ignored.

The remaining thing now is to change the sequencing macros. The comma separating `A_LIST_X` macros should be replaced by
something that just concatenates the expansions.

```cpp
#define REPEAT_1(M, ...)                          M(0, __VA_ARGS__)
#define REPEAT_2(M, ...) REPEAT_1(M, __VA_ARGS__) M(1, __VA_ARGS__)
#define REPEAT_3(M, ...) REPEAT_2(M, __VA_ARGS__) M(2, __VA_ARGS__)
...
#define REPEAT_500(M, ...) REPEAT_499(M, __VA_ARGS__) M(499, __VA_ARGS__) 
#define APPEND_INDEX(x, array) ::append<at(x, array)>::type

int main()
{
  typedef t_string<> REPEAT_500(APPEND_INDEX, "pig") P;
  std::cout << "P::c_str[" << P::size + 1 << "]=" << P::c_str << '\n';
}
```

The output from running this program is:

```shell
\> ./test6
P::c\_str\[4]=pig
```

Alright, just wrap it up in a fancy macro:

```cpp
#define T_STRING(x) t_string<> REPEAT_500(APPEND_INDEX, x)

class C : public T_STRING("piglet")
{
public:
  friend std::ostream& operator<<(std::ostream& os, const C&)
  {
    return os << C::c_str;
  }
};

int main()
{
  C c;
  std::cout << c << "\n";
}
```

# Conclusion

Once the idea hit home, it turns out that using strings as types isn't very difficult at all. What about the cost,
though?

There's performance and there's performance. Runtime performance of this construction is as good as it can ever get. Not
a single instruction is generated for the `t_string` templates. The only result of them is a read-only char array
generated at compile time, and those arrays are only generated for the `t_string` template instantiations where the
`c_str` member is used.

Compile time carries a cost, however. A very long preprocessor repetition (like the 500 used above) takes some time on
its own, and the template machinery will have some work to do. I don't have concrete measurements and in my experiments
the time has not been an issue, but it does take more time to compile than a simple

```cpp
static const char animal[] = "pig";
```

I, for one, can live with the small compile time cost, and believe it or not, I actually have a use for this - a problem
that would be very difficult, or at least very time consuming, to solve in other ways.
