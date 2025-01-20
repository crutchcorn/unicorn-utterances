---
{
  title: "Generate lambdas for clarity and performance",
  published: "2017-01-07",
  edited: "2024-12-12",
  tags: [ 'cpp' ]}
---

[Higher order functions](https://en.wikipedia.org/wiki/Higher-order_function), functions that operate on other functions
or returns functions, are familiar to those who have had some experience with functional programming, but they often
seems magical to those who have not. Some of those with experience of using higher order functions have a gut feeling
that they are expensive to use and prefer to avoid them.

Take this somewhat silly traditional C++ code:

```cpp
struct Employee
{
  using Number = unsigned;
  Number id;
  unsigned salary;
  std::string title;
  std::string name;
};

using staff = std::vector<Employee>;

auto devs_who_make_at_least(const staff& s, unsigned floor)
{
  std::vector<staff::value_type const*> rv;
  for (auto& e : s)
  {
    if (e.salary >= floor && e.title == "Developer")
    {
      rv.push_back(&e);
    }
  }
  return rv;
}
```

It's not very complex, and most C++ developers understand what it does in a few seconds. If this is the only place in
the entire code base that elements are selected from a [vector](http://en.cppreference.com/w/cpp/container/vector) of
`Employee`s, then all is well.

But what if there are several places? The code becomes cluttered with almost identical
copies of the same loop. This screams algorithm. None in the standard library is a perfect fit, though. Let's hand roll
a simple one.

# Building an algorithm

```cpp
template <typename Container, typename Pred>
auto elements_matching(Container const& c, Pred&& p)
{
  std::vector<typename Container::value_type const*> rv;
  for (auto& e : c)
  {
    if (p(e))
    {
      rv.push_back(&e);
    }
  }
  return rv;
}
```

It's not ideal, but it works with any container type and returns
a [vector](http://en.cppreference.com/w/cpp/container/vector) with pointers to the elements in the container that
matches the predicate.

With this, the `devs_who_make_at_least()` function becomes simple:

```cpp
auto devs_who_make_at_least(const staff& s, unsigned floor)
{
  auto pred = [floor](const Employee& e) {
    return e.salary >= floor && e.title == "Developer";
  };
  return elements_matching(s,pred);
}
```

This is cool, but what if there's more than one place in the code where you want to select employees based on salary or
title?

# C++14 utilities

C++14 introduced the auto return type, which is great for writing functions that generates lambdas.

Take for example:

```cpp
auto earns_at_least(unsigned floor)
{
  return [floor](const Employee& e) { return e.salary >= floor; };
}

auto has_title(const std::string& s)
{
  return [s](const Employee& e) { return e.title == s; };
}
```

Each of the above functions returns a lambda that has captured the function parameter. These can be quite expressively
used with the `elements_matching` algorithm introduced earlier:

```cpp
staff employees;

devs = elements_matching(employees, has_title("Developer"));
megaearners = elements_matching(employees, earns_at_least(1000000));
```

This is powerful on its own right. The code is easy to read. Most, even very inexperienced C++ developers, grasp the
intent directly, even if the mechanism may be unclear.

But what if we want more than one criteria, like selecting developers with a certain salary? Let's introduce an `and`
higher order function, that returns true if two contained predicates both return true.

```cpp
template <typename T, typename U>
auto pred_and(T&& t, U&& u)
{
  return [t = std::forward<T>(t),u = std::forward<U>(u)](auto&& x)
         { return t(x) && u(x); };
}
```

This function template `pred_and()`, creates a new predicate using two predicates. It will be true if and only if
both `t(x)`
and `u(x)` evaluates to true. It naturally short circuits the logic, so that if `t(x)` is false, `u(x)` is never
evaluated.

Now finding the super well paid developers who make more that 1M becomes so easy it doesn't even need a separate
function anymore.

```cpp
auto megadevs = elements_matching(employees,
                                  pred_and(earns_at_least(1000000), 
                                           has_title("Developer")));
```

# Performance

So what about performance, then? Surely this magic has a cost in confusing the optimiser?

I created a small test program that populates a [vector](http://en.cppreference.com/w/cpp/container/vector) of 5000
employees. 1/4 of them with `title = "Developer"`, and an unrealistically uniform random distribution salary in the
range
50000 - 250000. With those the program did 500000 loops, each filtering out the developers that make 150000 or more.
This was build with clang++ 3.9.

The output from the linux tool [perf](https://perf.wiki.kernel.org/index.php/Main_Page) are,

first from the hand made loop at the top of this post:

```
 Performance counter stats for './a.out':

   31 078 321 937      branch-instructions                                  
    2 055 192 607      branch-misses             #    6,61% of all branches         
   97 906 147 917      cpu-cycles                                           
  111 202 137 490      instructions              #    1,14  insn per cycle  

     32,974801101 seconds time elapsed
```

Then from using the algorithm and higher order function:

```
 Performance counter stats for './a.out':

   14 258 216 181      branch-instructions                                  
    1 513 180 390      branch-misses             #   10,61% of all branches         
   54 898 012 739      cpu-cycles                                           
   42 665 314 382      instructions              #    0,78  insn per cycle  

     18,747075752 seconds time elapsed
```

I must admit I was puzzled by this huge performance advantage of using higher order functions, especially when there has
been no attempt to optimise it at all. It turns out there's a small mistake in the hand written loop. It compares the
member `.title`, which is a [`std::string`](http://en.cppreference.com/w/cpp/string/basic_string) with the string
literal
`"Developer"`. This means it must make character by character comparison. The higher order function `has_title()`
captures
a [`std::string`](http://en.cppreference.com/w/cpp/string/basic_string), and equal comparison
of [`std::string`](http://en.cppreference.com/w/cpp/string/basic_string) begins with checking their lengths. If the
lengths are different there's no reason to look at the characters. That is the only reason I've seen for the huge gain.

Changing the hand written loop to compare title with
a [`std::string`](http://en.cppreference.com/w/cpp/string/basic_string) gives this result:

```
 Performance counter stats for './a.out':

   13 971 299 475      branch-instructions                                  
    1 449 744 816      branch-misses             #   10,38% of all branches         
   51 964 400 535      cpu-cycles                                           
   39 992 503 929      instructions              #    0,77  insn per cycle  

     17,448599597 seconds time elapsed
```

So, it is better performing. Not much. But it is. However, the hand written loop gets copied all over the code base, the
algorithm and higher order functions do not. The performance bug could've been made in the `has_title()` function as
well, but it would be one place to fix, not many. Likewise, the `elements_matching()` algorithm could be optimised, for
example with partial loop unrolling to do several comparisons per revolution. That too would be an effort spent once in
one place, and not all over the code.

That was the results with clang++-3.9. Let's see how g++ 6.2 fares in comparison. First the higher order function
version:

```
 Performance counter stats for './a.out':

   14 006 122 557      branch-instructions                                      
    1 027 464 337      branch-misses             #    7,34% of all branches         
   43 066 722 628      cpu-cycles                                               
   44 394 114 000      instructions              #    1,03  insn per cycle      

     14,505986613 seconds time elapsed
```

And then the hand written loop, with the fix to compare
with[std::string](http://en.cppreference.com/w/cpp/string/basic_string):

```
 Performance counter stats for './a.out':

   14 039 057 224      branch-instructions                                       
    1 852 376 974      branch-misses             #   13,19% of all branches         
   58 797 998 124      cpu-cycles                                                
   40 858 411 471      instructions              #    0,69  insn per cycle       

     19,743206041 seconds time elapsed
```

Here it's clear that gcc does a slightly worse job than clang with optimising the hand written loop, but does a
substantially better job at optimising the higher order function version.

# Wrap-up

As can be seen, the exact result does vary between compilers, but the chances of losing any performance to speak of when
using higher order functions are small, and there is the potential for very noticeable performance gains.

So, use algorithms and use higher order functions, for code clarity and for performance.