---
{
  title: "A flexible lexicographical comparator for C++ structs",
  published: "2016-01-01",
  edited: "2016-01-01",
  tags: ['cpp']}
---

We've all hand crafted comparison operators for structs with many members, and we've all cursed the tedium. It's all
right for equality comparison, but lexicographical ordering relations is a different story when there are more than two
members.

# Using `std::tie()`

Hopefully all C++ developers have by now learned about
the [`std::tie()`](http://www.cppsamples.com/common-tasks/lexicographic-ordering.html)-idiom.

```cpp
struct S
{
  int a;
  int b;
  int c;
};

bool operator<(const S& lh, const S& rh)
{
return std::tie(lh.a, lh.b, lh.c)
       < std::tie(rh.a, rh.b, rh.c);
}

```

[`std::tie()`](http://en.cppreference.com/w/cpp/utility/tuple/tie) creates
a [`std::tuple<>`](http://en.cppreference.com/w/cpp/utility/tuple) with references to the parameters, and the comparison
operators for std::tuple<> does its work memberwise, creating a lexicographical compare. It's all done inline and is as
efficient as can be.

But what if you want different ordering relations at different times? Take as an example the classic employee record,
where you may some times want to sort employees by name, some times by age, some times by employee number, some times by
years employed, some times by... you get the idea.

You can, of course, write comparator classes for each, implementing each function with `std::tie()` as above, but it's
still a repetitive tedium. Isn't that what computers are good at?

# Applying pointes to members

What if we could create a comparator by listing the ordering relation and which members, like this?

```cpp
struct S
{
  int a;
  int b;
  int c;
};

std::vector<S> ss = ...

auto comparator = lex_compare<std::less<>>(&S::a, &S::b, &S::c);

std::sort(std::begin(ss), std::end(ss), comparator);
```

Pointers to members are an old obscure construct in C++, so rarely used that they deserve a short intro before
continuing. `\&S::a` is a pointer to the member `a` in a struct `S`. It is used to access the member `a` in any instance
of struct `S`. A short example:

```cpp
struct S
{
  int a;
  int b;
  int c;
};

auto ptr = &S::a;

S s1;
S s2;

s1.*ptr = 1; // s1.a = 1
s2.*ptr = 2; // s2.a = 2

ptr = &S::b

s1.*ptr = 3; // s1.b = 3
s2.*ptr = 4; // s2.b = 4
```

Above, the type of `ptr` is `int S::\`*, which means that it can be reassigned to any member in struct `S` that is of
type `int`. That's why the assignment on line 16 works, both members `a` and `b` are of type `int`.

Now it is not a far stretch of the imagination to see that with a number of pointers to members, we can access the
member variables to compare in the desired order. For example, pointers to members in a `std::tuple<>` can be used like
this:

```cpp
struct S
{
  int a;
  int b;
  int c;
};

S s = ...

auto ms = std::make_tuple(&S::a, &S::c);

s.*std::get<0>(ms) = 1; // s.a;
s.*std::get<1>(ms) = 1; // s.c;

```

This doesn't look like much of an improvement, but it's a start to get the compiler engaged in generating code for us.
Time to switch to templates.

```cpp
template <typename ... Ms>
class comp
{
public:
  comp(std::tuple<Ms...> m) : ms(m) {}
  template <typename T>
  bool operator()(T const& lh, T const& rh) const
  {
     return // magic
  }
private:
  std::tuple<Ms...> ms;
};
```

Above, `Ms` is a template parameter pack. At this stage we know nothing about it, except that it is 0 or more types. The
member variable `ms` holds values of all such types, as provided by the constructor. This is all that is known
currently. The previous example also showed how the members of a `std::tuple<...>` can be accessed, but this requires
knowledge at compile time of their position in the std::tuple<...>.

All that is needed to reveal the magic is available, but only indirectly. A first start is operator `sizeof...(Ms)`,
which will tell, as a constexpr which can be used as a template parameter, how many elements the parameter pack, and
thus the `std::tuple\<Ms...>`, holds.

# C++14 improvements

C++14 introduced in the standard library a set of templates that are really handy for this. Two nearly indispensable
tools are [`std::index\_sequence\<Ns...>`](http://en.cppreference.com/w/cpp/utility/integer_sequence) and its
helper `std::make\_index\_sequence\<N>`.

These two takes us almost all the way to the magic.

```cpp
template <typename ... Ms>
class comp
{
public:
  comp(std::tuple<Ms...> m) : ms(m) {}
  template <typename T>
  bool operator()(T const& lh, T const& rh) const
  {
     using idxs = std::make_index_sequence<sizeof...(Ms)>;
     return compare(idxs{}, lh, rh);
  }
private:
  std::tuple<Ms...> ms;
};

```

Disappointed? You shouldn't be. `idxs` is a type `std::index\_sequence<...>` that holds all indexes, from 0 up until,
but not including, the number of elements in the `std::tuple\<Ms...>`, in sequence. This is all that is required to pick
the members and do the comparison. It is, however, necessary to go through the extra indirection. The `compare` function
then becomes:

```cpp
template <size_t ... Ns, typename T>
bool compare(std::index_sequence<Ns...>, T const& lh, T const& rh) const
{
  return std::tie(lh.*std::get<Ns>(ms)...)
       < std::tie(rh.*std::get<Ns>(ms)...);
}
```

Wait, what? Is that it? Yes, it is. Although perhaps a little explanation is useful.

Earlier I mentioned that [`std::make\_index\_sequence\<N>`](http://en.cppreference.com/w/cpp/utility/integer_sequence)
generates a sequence of all indexes from 0 up until, but not including `N`. Those are the `Ns` parameter pack above. The
construction `lh.\*std::get\<Ns>(ts)...` is repeated for every index is `Ns`, so the function effectively becomes (
provided the parameter pack size is 3):

```cpp
template <typename T>
bool compare(T const& lh, T const& rh) const
{
  return std::tie(lh.*std::get<0>(ms), lh.*std::get<1>(ms), lh.*std::get<2>(ms)))
       < std::tie(rh.*std::get<0>(ms), rh.*std::get<1>(ms), rh.*std::get<2>(ms));
}
```

This is what's wanted, isn't it?

Getting to the end goal is more or less trivial. A function to create the comparator object, and use a compare argument
instead of always using `operator<`.

```cpp
template <typename Comparator, typename ... Ms>
class memberwise_comparator : private Comparator
{
public:
  memberwise_comparator(std::tuple<Ms...> t) : ms(t) {}
  template <typename T>
  bool operator()(T const& lh, T const& rh) const
  {
    using idxs = std::make_index_sequence<sizeof...(Ms)>;
    return compare(idxs{}, lh, rh);
  }
private:
  template <size_t ... Ns, typename T>
  bool compare(std::index_sequence<Ns...>, T const& lh, T const& rh) const
  {
    const Comparator& comp = *this;
    return comp(std::tie(lh.*std::get<Ns>(ms)...),
                std::tie(rh.*std::get<Ns>(ms)...));
  }
  std::tuple<Ms...> ms;
};

template <typename Comp, typename ... T>
auto lex_compare(T ... t)
{
return memberwise_comparator<Comp, T...>{std::make_tuple(t...)};
}

```

Using inheritance for the comparator is just to enable
the [empty base class optimization](http://en.cppreference.com/w/cpp/language/ebo), since there is no way as written to
provide a comparator object that may hold state, and most state less comparators have no data, so it reduces the size of
the comparator object slightly.

# Performance

What about performance then? After all, this is C++ and we care about performance, and also everybody knows that this
type of encapsulated abstraction and templates cause bloat and kills the optimizer? Or?

Here's a short example function, compiled in a separate translation unit, so that it can be followed.

```cpp
bool is_sorted(std::vector<S> const& v)
{
  auto comparator = lex_compare<std::less<>>(&S::b, &S::a);
  return std::is_sorted(std::begin(v), std::end(v), comparator);
}

```

When compiled with g++ 5.2 for x86\_64 and optimized with -O3, the resulting code is:

```asm
        .file   "sorts.cpp"
       .section        .text.unlikely,"ax",@progbits
.LCOLDB0:
       .text
.LHOTB0:
       .p2align 4,,15
       .globl  _Z9is_sortedRKSt6vectorI1SSaIS0_EE
       .type   _Z9is_sortedRKSt6vectorI1SSaIS0_EE, @function
_Z9is_sortedRKSt6vectorI1SSaIS0_EE:
.LFB7573:
       .cfi_startproc
       movq    8(%rdi), %r8
       movq    (%rdi), %rdx
       cmpq    %rdx, %r8
       je      .L11
       leaq    12(%rdx), %rax
       cmpq    %rax, %r8
       je      .L3
       movl    16(%rdx), %esi
       movl    4(%rdx), %edx
       cmpl    %esi, %edx
       jle     .L6
       jmp     .L3
       .p2align 4,,10
       .p2align 3
.L13:
       movl    %ecx, %esi
.L6:
       cmpl    %edx, %esi
       jg      .L8
       movl    -12(%rax), %edi
       cmpl    %edi, (%rax)
       jl      .L3
.L8:
       addq    $12, %rax
       cmpq    %rax, %r8
       je      .L3
       movl    4(%rax), %ecx
       movl    %esi, %edx
       cmpl    %esi, %ecx
       jge     .L13
.L3:
       cmpq    %rax, %r8
       sete    %al
       ret
       .p2align 4,,10
       .p2align 3
.L11:
       movl    $1, %eax
       ret
       .cfi_endproc
.LFE7573:
       .size   _Z9is_sortedRKSt6vectorI1SSaIS0_EE, .-_Z9is_sortedRKSt6vectorI1SSaIS0_EE
       .section        .text.unlikely
.LCOLDE0:
       .text
.LHOTE0:
        .ident  "GCC: (Ubuntu 5.2.1-22ubuntu2) 5.2.1 20151010"
       .section        .note.GNU-stack,"",@progbits
```

The entire loop is between `.L13` and `.L3`, and the two element comparison is between `.L6` and `.L8`. All overhead of
indirection is gone. Compilers are good at this.

# Wrap-up

I thought this was cool and just wanted to share. Work can be made to allow stateful comparators, and to ensure more helpful compiler error messages in case of usage mistakes.
