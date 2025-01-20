---
{
  title: "Higher order functions as an enabler for lazy evaluation",
  published: "2017-01-08",
  edited: "2024-12-12",
  tags: [ 'cpp' ]}
---

Yesterday's post about [Generating lambdas for clarity and performance](/posts/generate-lambdas-for-clarity-and.html)
showed how to make use of higher order functions to improve clarity while giving the optimiser a chance to improve
performance, but the example used retained the original inflexible design.

Here's a short recap. Given a struct `Employee`, there is a function that filters out developers based on their salary.
The original code looked like this:

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

The code is by no means difficult to understand, but it lacks in flexibility, and loops like this spread over many
places in the code base becomes a maintenance liability.

# Improving the original

Enter a kind of filter function template, that like the `devs_who_make_at_least()` function, returns a vector of
[pointers](/posts/pointers-and-references-cpp) to the elements given, but using a provided predicate instead of a hard coded condition:

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

This is more generic. It works on any STL-like container and accepts any predicate that works on the value type. A few
sample higher order functions were introduced to select elements just as in the original example:

```cpp
auto earns_at_least(unsigned floor)
{
  return [floor](const Employee& e) { return e.salary >= floor; };
}

auto has_title(const std::string& s)
{
  return [s](const Employee& e) { return e.title == s; };
}

template <typename T, typename U>
auto pred_and(T&& t, U&& u)
{
  return [t,u](auto&& x) { return t(x) && u(x); };
}
```

Here pred\_and() is used to create a new predicate from two others, returning true only if both contained predicates
return true. Creating a vector of pointers to all developers that earn 1M or more simply becomes:

```cpp
auto megadevs = elements_matching(employees,
                                  pred_and(earns_at_least(1000000), 
                                           has_title("Developer")));
```

This was also shown to give performance gains over the original code.

So far so good, but what if the desired result is not a vector of pointers? What if we just want to calculate the
accumulated salary of those selected? It doesn't make sense to pay the cost of populating an array for that. What if not
all developers are needed, but you just need to browse through the selected ones until some other criteria is met? Then
it is unnecessary to have populated the vector with all of them.

# Enter lazy evaluation

The idea is to create yet another level of indirection, and defer calling the predicate until the
actual iteration is done.

What is wanted is something like this:

```cpp
auto megadevs = filter(employees,
                       pred_and(earns_at_least(1000000), 
                                has_title("Developer")));

// No iteration over employees yet
// No vector created.

uint64_t sum = 0;
for (auto i = megadevs.begin();// calls pred and increments until true or end
     i != megadevs.end();      // simple comparison
     ++i)                      // calls pred on incremented until true or end
{
  sum += i->salary;            // refers to element in employees
}
```

From this a design emerges. The type of `megadevs`, returned by the call to `filter()`, must have member
functions `begin()`
and `end()`. The iterators returned must have access to the iterators into `employees`, and must have access to the
predicate.

Here's an outline for the type returned by `filter()`:

```cpp
template <typename Container, typename Pred>
class filter_t
{
  using CI = typename Container::const_iterator;
 public:
  class iterator;

  template <typename P>
  filter_t(Container& c_, P&& p_)
   : c(c_), p(std::forward<P>(p_))  { }

  iterator begin() {
    auto i = c.begin();
    auto e = c.end();
    while (i != e && !p(*i))
      ++i;
    return { i, e, p };
  }

  iterator end() { return { c.end(), c.end(), p }; }
private:
  const Container& c;
  Pred             p;
};
```

Each instance must refer to the original container, and must access the predicate, so these types are template
parameters. The alias CI is just there for typographical purposes, making blog code shorter. The class `iterator` is
deferred for a while. I'll get back to it soon. The interesting part is the member function `begin()`. We want it to
create an iterator that refers to the first element in the container that fulfils the predicate, or end if there is no
such element. It does this by checking the predicate and incrementing until true. The returned filter iterator must have
the found iterator, the end, and the predicate, otherwise it cannot implement its increment operators.

> The natural implementation would be to use [`std::find_if()`](http://en.cppreference.com/w/cpp/algorithm/find) instead
> of incrementing and checking manually, but this was unexpectedly slow.

Now we can look at the `iterator` class:

```cpp
template <typename Container, typename Pred>
class filter_t<Container, Pred>::iterator
{
public:
  using value_type = typename std::iterator_traits<CI>::value_type;
  using reference = typename std::iterator_traits<CI>::reference;;
  using pointer = typename std::iterator_traits<CI>::pointer;
  using difference_type = typename std::iterator_traits<CI>::difference_type;
  using iterator_category = std::forward_iterator_tag;

  iterator(CI b, CI e, Pred& p_) : iter(b), iend(e), p(p_) { }

  reference operator*() const { return *iter; }

  iterator& operator++()
  {
    ++iter;
    while (iter != iend && !p(*iter))
      ++iter;
    return *this;
  }

  iterator operator++(int)
  {
    iterator rv(*this);
    ++*this;
    return rv;
  }

  bool operator==(const iterator& rh) const
  {
    return iter == rh.iter;
  }

  bool operator!=(const iterator& rh) const
  {
    return iter != rh.iter;
  }
private:
  CI       iter;
  CI const iend;
  Pred&    p;
};
```

It's quite a code block, but most is obvious. The aliases on lines 5-9 are there to make the iterator cooperate with
algorithms in the standard library.
See [`std::iterator_traits<>`](http://en.cppreference.com/w/cpp/iterator/iterator_traits) for details.

The other interesting part is `operator++()` on lines 15-21. As when created from the `begin()` member function of
`filter_t<>`, it searches for the next iterator in the referenced container until the predicate matches or the end is
reached. Also here, a hand written loop is used, after performance measurements showed an unexpected need.

With this in place, the `filter()` function template becomes nearly trivial:

```cpp
template <typename Container, typename Predicate>
inline filter_t<Container, std::remove_reference_t<Predicate>>
filter(Container& c, Predicate&& p)
{
  return { c, std::forward<Predicate>(p) };
}
```

Here's a good time to warn that this is a proof of concept code, intended to show the idea. For real world use, you
would for example need variants with mutable access and variants that take ownership of the container if it is
an [rvalue](http://en.cppreference.com/w/cpp/language/value_category), otherwise you cannot safely chain operations.
These variants change nothing in performance, but they do make the implementation rather more complex.

Now is a good time to see if this did any good. A slight modification is made from the sample program of yesterday. The
program populates a [vector](http://en.cppreference.com/w/cpp/container/vector) of 5000 employees. 1/4 of them with
`title = "Developer"`, and an unrealistically uniform random distribution salary in the range 50000 - 250000. With those
the program did 500000 loops, each filtering out the developers that make 150000 or more and calculates the accumulated
salary of the first 500.

```cpp
auto devs = filter(employees,
                   pred_and(earns_at_least(150000), 
                            has_title("Developer")));

int count = 500;
uint64_t sum = 0;
for (auto & d : devs)
{
  sum += d.salary;
  if (--count == 0) break;
}
```

Using g++ 6.2 and -O3, perf yields this result:

```
 Performance counter stats for './a.out':

   10 814 982 186      branch-instructions                                         
      752 594 101      branch-misses             #    6,96% of all branches         
   30 224 548 004      cpu-cycles                                                  
   29 445 937 781      instructions              #    0,97  insn per cycle         

     10,177892229 seconds time elapsed
```

Slightly rewriting the test program to add using the vector version from yesterday as:

```cpp
auto devs = elements_matching(employees,
                              pred_and(earns_at_least(150000), 
                                       has_title("Developer")));

int count = 500;
uint64_t sum = 0;
for (auto & d : devs)
{
  sum += d->salary;
  if (--count == 0) break;
}
```

gives the result:

```
 Performance counter stats for './a.out':

   14 881 795 600      branch-instructions                                         
    1 061 800 168      branch-misses             #    7,13% of all branches         
   45 275 693 140      cpu-cycles                                                  
   47 380 071 935      instructions              #    1,05  insn per cycle         

     15,215398962 seconds time elapsed
```

Here the advantage of lazy evaluation becomes obvious. We're only interested in the first 500 matches, so not populating
a vector with the remaining is a gain. However, in all fairness, it should be said that there is a cost to this
generality. The filter iterator shows much worse branch prediction results, and for large data sets, this can be
noticeable.

# Wrap-up

There it is. Higher order functions are by no means a necessity for lazy evaluation, but when you have them, it's not a
huge job to implement, and using it becomes natural. The lazy evaluation can give large performance gains, but there is
an added complexity which may back fire.

Expanding further on this sooner or later leads to a [range library](https://github.com/ericniebler/range-v3), but that is another story.
