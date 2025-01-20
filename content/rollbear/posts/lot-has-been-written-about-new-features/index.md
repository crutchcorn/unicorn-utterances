---
{
  title: "Exploring time keeping in ISO C++ 2011",
  published: "2011-09-25",
  edited: "2024-12-12",
  tags: [ 'cpp' ]}
---

A lot has been written about new features coming in the 2011 revision of ISO C++. One that has received surprisingly
little attention is the `<chrono>` header. The types and functions therein makes it so much simpler to write time
keeping software. Its neat simple interface is, however, also problematic.

# Introduction to `<chrono>`

Here's a small example program that shows both neatness and problems:

```cpp
#include <chrono>#include <thread> // std::this_thread::sleep_until()#include <iostream>#include <ostream>

template < typename T, long N, long D > std::ostream & operator << (std::ostream & os, std::chrono::duration < T, std::ratio < N, D > > & d) {
  os << d.count() << '*' << N << '/' << D << " seconds";
  return os;
}
int main() {
  const std::chrono::seconds desired_duration(1);
  auto before = std::chrono::system_clock::now();
  auto deadline = before + desired_duration;
  std::this_thread::sleep_until(deadline);
  auto after = std::chrono::system_clock::now();
  auto delay = after - deadline;
  std::cout << delay << std::endl;
}
```

A sample run says:

```
65*1/1000000 seconds
```

The header `<chrono>` contains the templates `time_point<>` and `duration<>` in addition to a smorgasboard of clocks,
all in the namespace `std::chrono`. In the example above, the variables `before`, `deadline` and `after` are all
instantiations of the `time_point<>` template, and the variables `desired_duration` and `delay` are instantiations of
the `duration<>` template.

You can subtract `time_points` to get a `duration`. You can add or subtract a `duration` and a `time_point` and get
another `time_point`. You can multiply or divide `duration`s with a scalar, and you can even divide `duration`s and get
their relative length as a scalar quotient.

One of the template parameters of `time_point<>` is the clock it came from, so you can't by mistake subtract
two `time_points` from different clocks.

As shown in the example above, the `duration`s are templatized on the type used to represent values, and a `ratio`
describing its base in seconds. The example above shows microseconds.

There are predefined convenience `duration` typedefs in
namescape `std::chrono`: `nanoseconds`, `microseconds`, `milliseconds`, `seconds`, `minutes` and `hours`.

Every clock has a typedef `period`, which is the ratio of the resolution of the clock. A small example program, using
the above templated `operator<<` for `duration`s displays the resolution of the system clock:

```cpp
int main()
{
  using namespace std::chrono;
  duration<int, system_clock::period> resolution(1);
  std::cout << resolution << '\n';
}
```

The output is:

```
1*1/1000000 seconds
```

# The problem

This computer's system clock uses microseconds to represent time.

Herein lies one of the problems with `<chrono>`. The resolution of clocks must be known at compile time. This means that
the makers of a standard library must strike a balance between giving the impression of a finer granularity clock than
is actually available, and making the types too coarse. The computer used to run this example program has a clock with
nanosecond granularity, but the library does not acknowledge its existence. I am of course free to implement my own
clock type for it, and it's not much work, but it feels unnecessary.

Converting between `duration`s with different resolutions is simple and safe. As long as the conversion can be done
without losing precision, it can be done implicitly. When the conversion causes loss of
precision, `std::chrono::duration_cast<>` is available.

The standard names three clocks. `system_clock`, `steady_clock` and `high_precision_clock`. The clock `steady_clock`,
was at times during the standardization process called `monotonic_clock`, and a number of C++ compilers ship with
libraries using that name. The steady clock is a clock that is not ever allowed to see time point adjustments, only rate
adjustments. It is thus very handy for server software that does carries out jobs at certain intervals, or for
profiling.

Unfortunately the standard allows the three to be typedef:ed to each other. In my library they are all typedefs for the
same clock. The implication of this is that my compiler right now allows the
calculation `std::chrono::high_precision_clock::now() - std::chrono::system_clock::now()`, since the time points
returned both refer to the same type. The exact same code may not compile on another conforming compiler, if its library
uses distinct types for those two clocks. I think that is unnecessary.

Yet a problem is that the clock static member function `now()` must be declared `noexcept` to be standards-conforming,
i.e. calling it must not cause any exception to be thrown. There is thus no possible way to check at run time if a clock
is available or not. If the library supports it, it must be there and it must work. I think this is bad.

For those of you who had hoped to see a `date` class, to do calendar work with, sorry - it isn't there.
