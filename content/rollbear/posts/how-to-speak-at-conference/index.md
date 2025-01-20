---
{
  title: "How to speak at a conference",
  published: "2018-11-29",
  edited: "2024-12-12",
  tags: [ 'opinion' ]}
---

A former colleague of mine recently described the steps to speak at a conference as:

- Write a proposal and (optionally) a talk outline.
- Get accepted by the conference organisers.
- Write the talk.
- Deliver the talk.

Cool!

This is not wrong, by the way.

But... how do you get accepted? I'm sorry, but I don't have any great advice here, but I can tell you what little I know from my limited experience.

# Dealing with rejection

First, and very important thing to keep in mind: **You're not being rejected, you're just not being accepted.**

Not being accepted means that competition is fierce, and other talks, on your chosen topic, were deemed more interesting than yours, or that your chosen topic did not quite match the conference.

Not being accepted doesn't mean you suck. It means
other talks were considered more interesting, and there's no shame in that. It obviously doesn't feel good if your
proposal wasn't accepted, but keep at it, refine your proposal, and try again. Maybe with the same topic from another
angle, or perhaps another topic, perhaps another conference?

Mind that not all conferences are alike, so there are differences, but the broad pictures is likely more or less the
same.

Let's start with two examples.

# Example 1

First the abstract. This is what the committee decides from, and also what's visible to the attendees to the conference.

> The Curiously Recurring Coupled Types Pattern.
>
> Why can pointers be subtracted but not added? What do raw C pointers, STL
> iterators, std::chrono types, and 2D/3D geometric primitives have in
> common? In this talk we will present some curiously coupled data types that
> frequently occur in your programs, together forming notions that you are
> already intuitively familiar with. We will shine a light on the
> mathematical notion of Affine Spaces, and how they guide stronger design.
> We will review the properties of affine spaces and show how they improve
> program semantics, stronger type safety and compile time enforcement of
> these semantics. By showing motivational examples, we will introduce you to
> the mathematical notion of affine spaces. The main focus will then be on
> how affine space types and their well defined semantics shape expressive
> APIs. We will give examples and guidelines for creating your own affine
> types.

And the accompanying outline, as envisioned by the time of the submission. This outline is preliminary, and you won't be
held accountable for it. It's an aid for the conference committee to decide. The conference committee knows that the
talk is not written yet; that this is an idea for a talk. I find that writing the outline also helps with figuring out a
structure for the talk:

> Show familiar examples of situations of affine space semantics - pointer
> arithmetic - iterators - chrono - coordinate systems
>
> - Mathematical definitions/properties
> - Describe properties of affine space types - operators and relations - \[show a Concept for affine space types, tbd]
> - Show how to write a simple affine space strong type template.
> - Parallels to unit systems

# Example 2

Here's the abstract for another talk that was accepted:

> Programming with Contracts in C++20
>
> Design by Contract is a technique to clearly express which parts of a
> program has which responsibilities. In the case of bugs, contracts can
> mercilessly point a finger at the part that violated the contract.
> Contracts are coming as a language feature in C++20. I will show how they
> can make your interfaces clearer with regards to use, but also point out
> pitfalls and oddities in how contracts are handled in C++. Writing good
> contracts can be difficult. I intend to give you guidance in how to think
> when formulating contracts, and how to design your interfaces such that
> good contracts can be written, because contracts have effects on interface
> design. Warning: Parts of the contents are personal opinion.

And its outline:

> Brief intro to the ideas behind Design by Contract Show what the current
> draft standard supports, including strengths, weaknesses and missing
> features. Propose rules of thumb for "best practices" with contracts in
> C++20. Show some gotchas to look out for.

# Is there a takeaway from this?

I think there are two takeaway messages.

1. It pays to think about how you want your talk to look like in the conference programme. This is difficult, and (at
   least for me) takes a disproportionate amount of time. It's only 100 or so words, after all, but expressing an idea
   very briefly is very hard.
2. It also takes luck. It's not your fault if you're not lucky. A talk one conference didn't accept, another one might,
   and vice versa. Keep trying (and if not offered, ask for why the proposal wasn't accepted - chances are there's
   valuable information there.)

If you get email saying your talk has been accepted, then congratulations! It is time for the big work to begin. Think
about how you best get your ideas across.

Who is your audience? How knowledgeable are they about your topic? 

Watch a
number of presentations you have liked, and study how the presenter does it. There are many different techniques.

Shamelessly steal techniques you think works well, and note what's problematic so that you can avoid it.

Writing the
presentation material does (for me) take a huge amount of time, and I keep revisiting it over and over, polishing for
better narrative, fixing bugs, improving visual style. 

One difficult thing to estimate is how long it takes to deliver
the talk. Aim for filling your slot reasonably well. It's not nice to overshoot, but it's also rude to your audience and
the conference organiser if you use up considerably less time than has been set aside for you. The only way to learn how
long it takes is to do it (after you have done it a few times, you get a feel for your slide-rate, but for your first
talk, you obviously have no idea.)

Dry run the talk for yourself. Leave space for audience interaction. Practice on your
colleagues. If it's a conference talk, try do do a practice run for your local user group. Solicit feedback, and improve
your presentation even more. Some speakers like to rehearse the talk very much, others prefer to improvise more. Find
out what works for you.

And, finally... **you** have things to say. **You** have experiences that are worth sharing. **Your** experiences will
valuable to others, but only if you share them. Speaking at conferences or local user groups isn't the only way to share
experiences, but don't dismiss it, OK?

**Share your experiences.**
