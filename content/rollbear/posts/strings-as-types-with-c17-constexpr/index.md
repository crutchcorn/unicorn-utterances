---
{
  title: "Expressing strings as types with C++17 constexpr lambdas",
  published: "2016-08-25",
  edited: "2024-12-12",
  tags: [ 'cpp' ]}
---

Recently I stumbled upon a question by [@arne_mertz](https://twitter.com/arne_mertz)
of [Simplify C++](http://arne-mertz.de/) fame — if you don't read that blog, start now! — about using string literals as
types.

In 2013 I wrote about [**strings as types**](/posts/strings-as-types), and the technique used works, but it's not
exactly elegant.

# The problem

To get from `"string literal"` to something like:

```cpp
template <char... c>
class String
{
  ...
};

String<'s', 't', 'r', 'i', 'n', 'g', ' ', 'l', 'i', 't', 'e', 'r', 'a', 'l'>
```

***This, it turns out, is not very easy.***

## C++11 utilities

C±±11 gave us [`constexpr`](http://en.cppreference.com/w/cpp/language/constexpr) functions, and C++14 added some helpful
utilities like [`integer_sequence<>`](http://en.cppreference.com/w/cpp/utility/integer_sequence), and from there you may
think code like the below would do the trick.

```cpp
template <char... c>
class String
{
  ...
};

template <std::size_t N, std::size_t ... I>
constexpr auto make_string_type(char const (&array)[N], std::index_sequence<I...>)
{
  return String<array[I]...>{};
}

#define STRING_TYPE(x) make_string_TYPE(x, std::make_index_sequence<sizeof(x)>{})
```

Unfortunately things aren't that simple. Although `make_string()` is `constexpr`, the parameter `array` loses its `constexpr`
property in the function, so `operator[]` does not give a `constexpr` result, and thus `String<array[I]...>` is ill formed
and gives a compilation error.

## Workaround

A possible way to get around that, is to let the macro create and call a lambda, and have the lambda contain the string
literal.

```cpp
#define STRING_TYPE(x) [](){ /*something*/ x /*something*/}()
```

Looking into the crystal ball, we see C++17 offering [`constexpr` lambdas](https://isocpp.org/files/papers/N4487.pdf), and
that gives an opening.

```cpp
#define STRING_TYPE(x)                                         \
  string_builder([](std::size_t i) constexpr { return x[i]; }, \
                 std::make_index_sequence<sizeof(x)>{})
```

The idea is that `string_builder()` calls the lambda for each index in
the [`std::index_sequence<>`](http://en.cppreference.com/w/cpp/utility/integer_sequence) from 0 to the length of the
string literal. The `constexpr` lambda returns the character in position `i` of the string literal.

A possible implementation of `string_builder()` is

```cpp
template <typename F, std::size_t ... I>
constexpr auto string_builder(F f, std::index_sequence<I...>)
{
  return String<f(I)...>{};
}
```

This almost seems like magic, but it's not that weird. `f` is the `constexpr` lambda that returns a `char` for a position in
the string literal. `I...` are all indexes from 0 to sizeof the string literal. Since `f` is `constexpr`, `String<f(I)...>` is
well formed.

So, what's the cost of doing this? Well, the cost is build time. Runtime has no overhead compared to a fixed string
global somewhere.

Look at this example:

```cpp
template <char ... c>
struct String
{
  static char const buffer[sizeof...(c)];
};

template <char ... c>
char const String<c...>::buffer[sizeof...(c)] = { c... };

void func(char const*);

int main()
{
  auto n = STRING_TYPE("nonsense");
  func(n.buffer);
}
```

Using clang++ (svn trunk on 2016-08-25) the output from `clang++ -std=c++1z str.cpp -O1 -S` is

```cpp
.text
        .file   "str.cpp"
        .globl  main
        .p2align        4, 0x90
        .type   main,@function
main:                                   #@main
        .cfi_startproc
# BB#0:
        pushq   %rax
.Ltmp0:
        .cfi_def_cfa_offset 16
        movl    String<(char)110, (char)111, (char)110, (char)115, (char)101, (char)110, (char)115, (char)101, (char)0>::buffer, %edi
        callq   func(char const*)
        xorl    %eax, %eax
        popq    %rcx
        retq
.Lfunc_end0:
        .size   main, .Lfunc_end0-main
        .cfi_endproc

        .type   String<(char)110, (char)111, (char)110, (char)115, (char)101, (char)110, (char)115, (char)101, (char)0>::buffer,@object # @String<(char)110, (char)111, (char)110, (char)115, (char)101, (char)110, (char)115, (char)101, (char)0>::buffer
        .section        .rodata._ZN6StringIJLc110ELc111ELc110ELc115ELc101ELc110ELc115ELc101ELc0EEE6bufferE,"aG",@progbits,String<(char)110, (char)111, (char)110, (char)115, (char)101, (char)110, (char)115, (char)101, (char)0>::buffer,comdat
        .weak   String<(char)110, (char)111, (char)110, (char)115, (char)101, (char)110, (char)115, (char)101, (char)0>::buffer
String<(char)110, (char)111, (char)110, (char)115, (char)101, (char)110, (char)115, (char)101, (char)0>::buffer:
        .asciz  "nonsense"
        .size   String<(char)110, (char)111, (char)110, (char)115, (char)101, (char)110, (char)115, (char)101, (char)0>::buffer, 9


        .ident  "clang version .0.0 (trunk 279733)"
        .section        ".note.GNU-stack","",@progbits
```

The above is perhaps not obvious, but at line 12, the address to the beginning of `String<>::buffer` is stored in register
`edi`, in preparation for the function call on line 13.

Line 25 shows that the buffer is the string `"nonsense"`.

---

# Wrap-up

With this solution, there is no run time overhead what so ever. However, each unique string used is its own symbol, which may increase
link time, and the compile time computation required to get the string from the string, is of course not for free.

Hope you enjoyed the article!
