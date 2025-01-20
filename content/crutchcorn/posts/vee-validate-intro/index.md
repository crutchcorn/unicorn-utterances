---
{
    title: "Intro to VeeValidate",
    description: "Learn how to simplify form validation in Vue.js with this powerful library, featuring seamless integration and customizable rules.",
    published: '2025-01-01T22:12:03.284Z',
    tags: ["vue", "javascript", "webdev"]
}
---

Forms are a critical part of many web apps; Vue apps included. While Vue has a large home-grown ecosystem of tools, Vue does not have an official complex form library. Luckily for us, [`vee-validate` aims to be a good fit for any form requirements our Vue apps may have](https://github.com/logaretm/vee-validate).

Here's a simple form using `vee-validate`:

```vue
<!-- FormComp.vue -->
<script setup>
import { Form as VForm, Field as VField } from 'vee-validate'

function onSubmit(values) {
  console.log(values)
}
</script>

<template>
  <VForm @submit="onSubmit">
    <div>
      <label>
        Name
        <VField name="name" value="" />
      </label>
    </div>

    <div>
      <label>
        Email
        <VField name="email" value="" />
      </label>
    </div>
    <button type="submit">Submit</button>
  </VForm>
</template>
```

> Here, we'll use the `import {Something as SomethingElse}` syntax in order to avoid namespace collision (where two things are named the same, and the compiler has challenges figuring out which is which) with [HTML's default `form` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form).

<iframe data-frame-title="Simple Form - StackBlitz" src="pfp-code:./simple-form-1?template=node&embed=1&file=src%2FFormComp.vue"></iframe>

# Input States {#input-states}

`VForm` and `VField` also have the ability to access the component's inner state using [`v-slot`](/posts/ffg-fundamentals-accessing-children#passing-values-to-projected-content). This enables us to access if a form or field is:

- Touched: if the user has clicked or tabbed into a field, regardless of if the user has put any value in.
- Dirty: if data has been placed into a field

```vue
<!-- FormComp.vue -->
<script setup>
import { ref } from 'vue'
import { Form as VForm, Field as VField } from 'vee-validate'

const pending = ref(false)
const submitted = ref(false)

function onSubmit(values) {
  submitted.value = true
  pending.value = true
  sendToServer(values).then(() => {
    pending.value = false
  })
}

// Pretend this is calling to a server
function sendToServer(formData) {
  // Wait 4 seconds, then resolve promise
  return new Promise((resolve) => setTimeout(() => resolve(0), 4000))
}
</script>

<template>
  <VForm @submit="onSubmit" v-slot="{ meta }">
    <div>
      <label>
        Name
        <VField name="name" value="" v-slot="{ field, meta }">
          <input v-bind="field" />
          <p v-if="meta.dirty">Field is dirty</p>
          <p v-if="meta.touched">Field has been touched</p>
        </VField>
      </label>
    </div>

    <div>
      <label>
        Disabled field
        <VField disabled name="email" value="" />
      </label>
    </div>
    <p v-if="meta.dirty">Form is dirty</p>
    <p v-if="meta.touched">Form has been touched</p>
    <p v-if="submitted">Form submitted</p>
    <p v-if="pending">Form is pending</p>
    <button type="submit">Submit</button>
  </VForm>
</template>
```

<iframe data-frame-title="Input States - StackBlitz" src="pfp-code:./input-states-2?template=node&embed=1&file=src%2FFormComp.vue"></iframe>

# Form Arrays {#form-arrays}

In many forms, we need to track a list of fields.

An example of this could be keeping track of a list of users you'd want to share a file with. 

To do this, you're able to use `v-for` to iterate through each user index and use said index to alias the `name` property of `v-field` to access a user's information:

```vue
<!-- FormComp.vue -->
<script setup>
import { ref } from 'vue'
import { Form as VForm, Field as VField, FieldArray } from 'vee-validate'

const initialValues = { users: [{ name: '', id: 0 }] }
const id = ref(1)

function onSubmit(values) {
  console.log(values)
}
</script>

<template>
  <div>
    <h1>Friend List</h1>
    <VForm @submit="onSubmit" :initial-values="initialValues">
      <FieldArray name="users" key-path="id" v-slot="{ fields, push, remove }">
        <div v-for="(field, idx) in fields" :key="field.key">
          <label>
            Name
            <VField :name="'users[' + idx + '].name'" />
          </label>
          <button type="button" @click="remove(idx)">Remove User</button>
        </div>
        <button type="button" @click="push({ name: '', id: ++id })">Add User</button>
      </FieldArray>
      <button type="submit">Submit</button>
    </VForm>
  </div>
</template>
```

Our usage of `key-path` with the `id` to track which user is which is worth highlighting here. Because we're now using an array, we need a unique ID for each user, [otherwise we might run into issues with Vue's ability to figure out which user is which when adding a new field](/posts/ffg-fundamentals-dynamic-html#keys).

<iframe data-frame-title="Form Arrays - StackBlitz" src="pfp-code:./form-arrays-3?template=node&embed=1&file=src%2FFormComp.vue"></iframe>

# Form Validation {#form-validation}

While handling forms is great and all - it's form _validation_ where things get tricky in most apps. The ability to prevent users from submitting and showing error messages is a critical component of most all forms.

Luckily, `vee-validate` allows you to pass a `rules` parameter that's a function. If the function returns anything other than `true`, it will display the value as the error in the `ErrorMessage` component.

```vue
<!-- FormComp.vue -->
<script setup>
import { ref } from 'vue'
import { Form as VForm, Field as VField, ErrorMessage } from 'vee-validate'

function onSubmit(values) {
  console.log(values)
}
function required(value) {
  // Validation failed!
  if (!value) return 'This field is required'

  // Validation passed!
  return true
}
</script>

<template>
  <VForm @submit="onSubmit">
    <div>
      <label>
        Name
        <VField name="name" value="" :rules="required" />
      </label>
    </div>
    <div>
      <ErrorMessage name="name" />
    </div>

    <button type="submit">Submit</button>
  </VForm>
</template>
```

<iframe data-frame-title="Form Validation - StackBlitz" src="pfp-code:./form-validation-4?template=node&embed=1&file=src%2FFormComp.vue"></iframe>

## Complex Data Schema

Instead of writing our own functions to validate user input, let's instead use a library that can do that validation for us.

[`yup` is a library that allows us to do "schema" based validation](https://github.com/jquense/yup). A schema is simply another way of saying "a set of rules that should be followed". In this case, we want Yup to make sure that the user's inputs match the rules we set up in Yup's validation.

We can then pass that Yup schema into `vee-validate`'s `VForm` `validationSchema` property.

```vue
<!-- FormComp.vue -->
<script setup>
import { Form as VForm, Field as VField, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'

const formSchema = yup.object().shape({
  name: yup.string().required(),
})

function onSubmit(values) {
  console.log(values)
}
</script>

<template>
  <VForm @submit="onSubmit" :validationSchema="formSchema">
    <div>
      <label>
        Name
        <VField name="name" value="" />
      </label>
    </div>
    <div>
      <ErrorMessage name="name" />
    </div>

    <button type="submit">Submit</button>
  </VForm>
</template>
```

<iframe data-frame-title="Complex Data Schema - StackBlitz" src="pfp-code:./complex-data-schema-5?template=node&embed=1&file=src%2FFormComp.vue"></iframe>

By default, Yup will attempt to figure out the error message it should show based on the schema and the user's input. However, we're able to change the error message displayed by Yup with the following:

```javascript
const formSchema = yup.object().shape({
  name: yup.string().required("You must input a name of the user to share with."),
});
```

## Validation Types

Marking a field as required is far from the only type of form validation. While there are any number of items, there

- Minimum string length
- Maximum string length
- Two inputs match each other
- Match a regex

Here's a playground where we demonstrate a form that validates all of those examples:

```vue
<!-- FormComp.vue -->
<script setup>
import { Form as VForm, Field as VField, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'

const formSchema = yup.object().shape({
  minLenStr: yup.string().min(3),
  maxLenStr: yup.string().max(3),
  regex: yup.string().matches(/hello|hi/i),
  pass: yup.string(),
  confirm: yup.string().oneOf([yup.ref('pass'), null], 'Must match "password" field value'),
})

function onSubmit(values) {
  console.log(values)
}
</script>

<template>
  <VForm @submit="onSubmit" :validationSchema="formSchema">
    <div>
      <label>
        Minimum Length String (3)
        <VField name="minLenStr" value="" />
      </label>
    </div>
    <div>
      <ErrorMessage name="minLenStr" />
    </div>
    <div>
      <label>
        Maximum Length String (3)
        <VField name="maxLenStr" value="" />
      </label>
    </div>
    <div>
      <ErrorMessage name="maxLenStr" />
    </div>
    <div>
      <label>
        Regex
        <VField name="regex" value="" />
      </label>
    </div>
    <div>
      <ErrorMessage name="regex" />
    </div>
    <div>
      <label>
        Password
        <VField name="pass" type="password" value="" />
      </label>
    </div>
    <div>
      <label>
        Password Confirm
        <VField name="confirm" type="password" value="" />
      </label>
    </div>
    <div>
      <ErrorMessage name="confirm" />
    </div>
    <button type="submit">Submit</button>
  </VForm>
</template>
```

<iframe data-frame-title="Validation Types - StackBlitz" src="pfp-code:./validation-types-6?template=node&embed=1&file=src%2FFormComp.vue"></iframe>

# Non-Text Form Fields

Not all fields in a form are going to be text inputs, however. You might want to introduce a checkbox to the user to make sure they've accepted terms and conditions, have a dropdown of time zones, or have a date picker for the user to input a time.

Just like text inputs, you can combine these input types with validation!

While there are many other types of user input elements, let's focus on just one: Checkboxes.

`vee-validate` supports casting a `VField` to a different `input` `type`, just like React's Formik. Luckily for us, usage with `yup` is for checkboxes as simple as adding the `required` validator to Yup's schema shape.

```vue
<!-- FormComp.vue -->
<script setup>
import { Form as VForm, Field as VField, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'

const formSchema = yup.object().shape({
  termsAndConditions: yup.bool().required('You need to accept the terms and conditions'),
})

function onSubmit(values) {
  console.log(values)
}
</script>

<template>
  <VForm @submit="onSubmit" :validationSchema="formSchema">
    <div>
      <label>
        Terms and Conditions
        <VField name="termsAndConditions" type="checkbox" :value="true" />
      </label>
    </div>
    <div>
      <ErrorMessage name="termsAndConditions" />
    </div>

    <button type="submit">Submit</button>
  </VForm>
</template>
```

<iframe data-frame-title="Non-Text Form Fields - StackBlitz" src="pfp-code:./non-text-form-fields-7?template=node&embed=1&file=src%2FFormComp.vue"></iframe>

# Conclusion

Hopefully this has been helpful to see into VeeValidate's usage.

If you liked this and want to learn more Vue for free, you might want to check out [my book series titled "The Framework Field Guide", which teaches React, Angular, and Vue all at once for free.](https://framework.guide)

Take care!
