---
{
  title: "Introducing the Trompeloeil C++ mocking framework",
  published: "2014-12-13",
  edited: "2024-12-12",
  tags: [ 'cpp', 'testing' ]}
---

[Trompeloeil](https://github.com/rollbear/trompeloeil) is a new mocking framework for C++, aimed at ease of use without
sacrificing expressive power.

In arts, trompeloeil is intended to mock your mind, making you believe you see something that isn't what it appears to
be. In unit tests, we use use mocks to fool the unit under test, so that we can break dependencies and test small pieces
in isolation.

[Trompeloeil](https://github.com/rollbear/trompeloeil) requires a reasonably C++14 compliant compiler (gcc-4.9 and
clang-3.5 are known to work.) It is a single header file only, so there is no need to worry about compiler-flag
compatibility issues between the test code and the framework. [Trompeloeil](https://github.com/rollbear/trompeloeil) is
released under the BOOST SOFTWARE LICENSE 1.0.

# Simple example

Let's dive in to mocking with [Trompeloeil](https://github.com/rollbear/trompeloeil) by writing tests for the order
class of a warehouse, following the example in [Martin Fowler](http://martinfowler.com/)'s
post [Mocks Aren't Stubs](http://martinfowler.com/articles/mocksArentStubs.html).

The order class looks like below:

```cpp
class Order
{
public:
  Order(const std::string& name, size_t amount);
  void fill(Warehouse& w);
  bool is_filled() const;
};
```

Warehouse in an interface looking like this:

```cpp
class Warehouse
{
public:
  virtual bool hasInventory(const std::string& name, size_t amount) const = 0;
  virtual void remove(const std::string& name, size_t amount) = 0;
};
```

From the interface, a mock class can be created. The mechanism is nearly identical to that
of [GoogleMock](https://code.google.com/p/googlemock/).

```cpp
class WarehouseMock : public Warehouse
{
public:
  MAKE_CONST_MOCK2(hasInventory, bool(const std::string&, size_t));
  MAKE_MOCK2(remove, void(const std::string&, size_t));
};
```

`MAKE_MOCKn` creates a mock implementation of a non-const member function with n parameters, and `MAKE_CONST_MOCKn`
creates a mock implementation of a const member function. The first parameter of each macro is the name of the member
function, and the second parameter is the function signature. [Trompeloeil](https://github.com/rollbear/trompeloeil)
supports up to 15 parameters in a function signature.

From this we can write a first simple test for the `Order` class.

```cpp
TEST(filling_removes_inventory_if_in_stock)
{
  Order order("Talisker", 50);

  WarehouseMock warehouse;
  {
    REQUIRE_CALL(warehouse, hasInventory("Talisker", 50))
      .RETURN(true);

    REQUIRE_CALL(warehouse, remove("Talisker", 50));

    order.fill(warehouse);
  }

  ASSERT_TRUE(order.is_filled());
}
```

`REQUIRE_CALL` on lines 7 and 10 are what they sound like. For each, a matching call is required exactly once. The
requirement must be met by the end of the surrounding scope, or a violation is reported.

If several `REQUIRE_CALL` could match the same call, they are tried in reversed order, until a match is found. This
allows you to declare an open default early in your test, and add restricted specializations later when needed.

A weakness in the above, however, is that no sequencing is implied. The two `REQUIRE_CALL`s are considered logically
parallel, i.e. the order of the calls is of no significance to the outcome of the test. To ensure that the test passes
only if `hasInventory` is called before `remove`, a sequence object is introduced:

```cpp
TEST(filling_removes_inventory_if_in_stock)
{
  Order order("Talisker", 50);

  WarehouseMock warehouse;
  {
    trompeloeil::sequence seq;
    REQUIRE_CALL(warehouse, hasInventory("Talisker", 50))
      .IN_SEQUENCE(seq)
      .RETURN(true);

    REQUIRE_CALL(warehouse, remove("Talisker", 50))
      .IN_SEQUENCE(seq);

    order.fill(warehouse);
  }

  ASSERT_TRUE(order.is_filled());
}
```

Now the test will fail if `remove` is called before `hasInventory`.

Let's add another test for trying to order more than is available in inventory:

```cpp
TEST(filling_does_not_remove_if_not_in_stock)
{
  Order order("Talisker", 51);

  WarehouseMock warehouse;
  {
    REQUIRE_CALL(warehouse, hasInventory("Talisker", 51))
      .RETURN(false);

    order.fill(warehouse);
  }

  ASSERT_FALSE(order.is_filled());
}
```

# Expectations and fixtures

This is straight forward, but there is a problem with repetition between the two tests. Let's refactor the code by
breaking out the common code.

```cpp
using trompeloeil::_;

const auto talisker = "Talisker";

struct TaliskerStore
{
  size_t                stock;
  trompeloeil::sequence seq;
  WarehouseMock         mock;
  std::unique_ptr<trompeloeil::expectation> inventory
    = NAMED_REQUIRE_CALL(mock, hasInventory(talisker, _))
      .IN_SEQUENCE(seq)
      .RETURN(_2 <= stock);
};

TEST(filling_removes_inventory_if_in_stock)
{
  Order order(talisker, 50);
  {
    TaliskerStore warehouse{50};

    REQUIRE_CALL(warehouse.mock, remove(talisker, 50))
      .IN_SEQUENCE(warehouse.seq);

    order.fill(warehouse.mock);
  }
  ASSERT_TRUE(order.is_filled());
}

TEST(filling_does_not_remove_if_not_in_stock)
{
  Order order(talisker, 51);
  {
    TaliskerStore warehouse{50};

    order.fill(warehouse.mock);
  }
  ASSERT_FALSE(order.is_filled());
}
```

`trompeloeil::_` on line 1 is a wildcard used in `REQUIRE_CALL` when any value is acceptable.

Since `REQUIRE_CALL` must be met by the end of the surrounding scope, it works poorly in fixtures. `NAMED_REQUIRE_CALL`
creates an expectation object to be held by a `std::unique_ptr<trompeloeil::expectation>`. This is seen on lines 10-13.
The call must be met by the time the object is destroyed.

On line 13, the `_2` refers to the second parameter of the function call (the one matched with the wildcard,) so the
return value will be true if the amount asked for is available in stock, and false otherwise.

# Mocking with side effects

An alternative rewrite is to move more of the test logic into the fixture, making it behave like a reasonable test
store, implemented in terms of the mock.

```cpp
using trompeloeil::_;

const auto talisker = "Talisker";

struct TaliskerStore
{
  using named_expectation = std::unique_ptr<trompeloeil::expectation>;

  size_t                stock;
  trompeloeil::sequence seq;
  WarehouseMock         mock;
  named_expectation talisker_inventory
    = NAMED_REQUIRE_CALL(mock, hasInventory(talisker, _))
      .IN_SEQUENCE(seq)
      .TIMES(AT_LEAST(1))
      .LR_RETURN(_2 <= stock);
  named_expectation remove
    = NAMED_ALLOW_CALL(mock, remove(talisker, _))
      .IN_SEQUENCE(seq)
      .LR_WITH(_2 <= stock)
      .LR_SIDE_EFFECT(stock -= _2);
};

TEST(filling_removes_inventory_if_in_stock)
{
  Order order(talisker, 50);
  {
    TaliskerStore warehouse{50};

    order.fill(warehouse.mock);

    ASSERT_TRUE(warehouse.stock == 0U);
  }
  ASSERT_TRUE(order.is_filled());
}

TEST(filling_does_not_remove_if_not_in_stock)
{
  Order order(talisker, 51);
  {
    TaliskerStore warehouse{50};

    order.fill(warehouse.mock);

    ASSERT_TRUE(warehouse.stock == 50U);
  }
  ASSERT_FALSE(order.is_filled());
}
```

`.TIMES(AT_LEAST(1))` on line 15 alters the default of requiring exactly 1 matching call. You can use `.TIMES(2)` to
require exactly 2 matching calls, `.TIMES(2,5)` to require 2 through 5 matching calls. Naturally, there is also an
`AT_MOST(n)` that can be used.

The `.LR_RETURN(_2 <= stock)` on line 16 looks a bit odd. `.WITH()`, `.SIDE_EFFECT()`, `.RETURN()` and `.THROW()` all
refers to
copies of local names, whereas the `LR_`-prefixed versions accesses them by reference. So, a `.RETURN(_2 <= stock)`
would
always compare `_2` with the value stock had when the expectation object was created, whereas `.LR_RETURN(_2 <= stock)`
compares `_2` with the value the member variable stock has at the time of the matching call.

`NAMED_ALLOW_CALL()` on line 18 is a shorthand for `NAMED_REQUIRE_CALL(...).TIMES(0,infinity)`, i.e. an absence of calls
is OK and infinitely many calls are equally OK. There is also a `FORBID_CALL()` with obvious meaning.

`.LR_WITH(_2 <= stock)` on line 20, makes the call match only if `_2` <= the value of the member variable stock at the
time of the call. `.WITH()` and `.LR_WITH()` tests are always tried first when a matching signature is found. You can
add
as many `.WITH()` and `.LR_WITH()` as you like for an expectation. They are tried in the order they are added.

`.LR_SIDE_EFFECT(stock -= _2)` subtracts `_2` from the member variable stock. You can add as many `.SIDE_EFFECT()` and
`.LR_SIDE_EFFECT()` as you like to an expectation. They are executed in the order they are added, provided that the
signature and the `.WITH()` and `.LR_WITH(`) conditions matched.

Sequencing may seem a bit odd when the number of calls required to match is not an exact number.
In [Trompeloeil](https://github.com/rollbear/trompeloeil) a sequence restriction is satisfied when the minimum number of
calls is reached. In the example above, this means that it is an error if `remove` is called before `hasInventory`, but
it
is OK to never call `remove`, since the minimum number of calls is 0, which is trivially satisfied. It is likewise OK to
call `hasInventory` many many times before `remove`, and then call `hasInventory` again followed by further calls
to `remove`.

# Wrap-up

Please give [Trompeloeil](https://github.com/rollbear/trompeloeil) a try and give feedback - or better yet, join the job
and submit improvements! My experience is that its use of direct expressions/statements in the expectations together
with the strict control of deadline for a match through the normal C++ lifetime rules makes it very easy to work with.
