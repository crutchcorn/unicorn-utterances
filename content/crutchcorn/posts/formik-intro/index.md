---
{
    title: "Intro to Formik",
    description: "Learn how to streamline form handling in React with this popular library, featuring easy validation, state management, and submission handling.",
    published: '2025-01-01T22:12:03.284Z',
    tags: ["react", "javascript", "webdev"]
}
---

React is a powerful library for building user interfaces, but it doesn't come with a built-in way to handle forms. While there are many libraries that can help supplement this issue, it can be difficult to know which one to choose.

One such option for form handling is [Formik](https://formik.org/) comes in. Formik is a popular library that simplifies form handling in React, providing a set of tools to manage form state, validation, and submission.

Here's what a basic form might look like in Formik:

```jsx {10-18,20,24-29}
import { useFormik } from "formik";

const FormComponent = () => {
  /**
   * Formik provides us a hook called "useFormik" which allows us to
   * define the initial values and submitted behavior
   * 
   * This return value is then used to track form events and more
   */
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div>
        <label>
          Name
          <input
            type="text"
            name="name"
            onChange={formik.handleChange}
            value={formik.values.name}
          />
        </label>
      </div>
      <div>
        <label>
          Email
          <input
            type="text"
            name="email"
            onChange={formik.handleChange}
            value={formik.values.email}
          />
        </label>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};
```

<iframe data-frame-title="Basic Form - StackBlitz" src="pfp-code:./basic-form-1?template=node&embed=1&file=src%2FApp.jsx"></iframe>

# `<Formik/>` Component 

The `useFormik` hook isn't the only way to declare a form, however. Formik also provides a set of components that can then be used in place of a hook.

```jsx {5-14}
import { Formik } from "formik";

const FormComponent = () => {
    return (
        <Formik
            initialValues={{
                name: "",
                email: "",
            }}
            onSubmit={(values) => {
                console.log(values);
            }}
        >
            {({ values, handleChange, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>
                            Name
                            <input
                                type="text"
                                name="name"
                                onChange={handleChange}
                                value={values.name}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Email
                            <input
                                type="text"
                                name="email"
                                onChange={handleChange}
                                value={values.favoriteFood}
                            />
                        </label>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            )}
        </Formik>
    );
};

```

This component isn't just useful as an alternative API, however. It also enabled us to use functionality like Formik's built-in `Form` and `Field` components, which allows us to remove the `onSubmit` and `onChange` method passing for a more terse API.

```jsx {12,16,22,26}
import { Formik, Form, Field } from "formik";

const FormComponent = () => {
    return (
        <Formik
            initialValues={{
                name: '',
                email: '',
            }}
            onSubmit={(values) => {
                console.log(values);
            }}
        >
            {() => (
                <Form>
                    <div>
                        <label>
                            Name
                            <Field type="text" name="name" />
                        </label>
                    </div>
                    <div>
                        <label>
                            Email
                            <Field type="text" name="email" />
                        </label>
                    </div>
                    <button type="submit">Submit</button>
                </Form>
            )}
        </Formik>
    );
};
```

<iframe data-frame-title="Formik Component - StackBlitz" src="pfp-code:./formik-component-2?template=node&embed=1&file=src%2FApp.jsx"></iframe>

> Keep in mind that the `Field` and `Form` components will not work when using `useFormik`. This is because of underlying implementation details that [rely on React's Dependency Injection](/posts/ffg-fundamentals-dependency-injection). Instead, you'd have to pass `onChange` and `onSubmit`, respectively, to `input` and `form` HTML elements, as we demonstrated before.

# Input States {#input-states}


Formik provides the states for:

- Touched fields: Fields that have been entered into by the user, but may not yet have typed anything into
- Dirty forms: If any fields have had input typed into them
- Submitted forms

```jsx
const FormComponent = () => {
  const [isPending, setIsPending] = useState(false);
  return (
    <Formik
      initialValues={{
        name: '',
        email: '',
      }}
      onSubmit={(values) => {
        setIsPending(true);
        sendToServer(values).then(() => setIsPending(false));
      }}
    >
      {({ touched, dirty, isSubmitting }) => (
        <Form>
          <div>
            <label>
              Name
              <Field type="text" name="name" />
            </label>
            {touched.name && <p>This field has been touched</p>}
            {!touched.name && <p>This field has not been touched</p>}
          </div>
          <div>
            <label>
              Disabled Field
              <Field type="text" name="email" disabled />
            </label>
          </div>
          {/* Formik doesn't provide "dirty" on a field-level basis */}
          {dirty && <p>This form is dirty</p>}
          {isSubmitting && <p>Form is submitted</p>}
          {isPending && <p>Form is pending</p>}
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};

// Pretend this is calling to a server
function sendToServer(formData) {
  // Wait 4 seconds, then resolve promise
  return new Promise((resolve) => setTimeout(() => resolve(), 4000));
}
```

<iframe data-frame-title="Input States - StackBlitz" src="pfp-code:./input-states-3?template=node&embed=1&file=src%2FApp.jsx"></iframe>

# Form Arrays {#form-arrays}

Formik provides a `FieldArray` to help make handling arrays easier with Formik fields. Similar to Formik's `Field` and `Form` components, `FieldArray` only works when using the `Formik` component instead of the `useFormik` hook.

```jsx
import { Formik, Form, Field, FieldArray } from "formik";

// We'll explain why we need an id a bit later
let id = 0;

export const FriendList = () => (
  <div>
    <h1>Friend List</h1>
    <Formik
      initialValues={{ users: [{name: "", id: ++id}] }}
      onSubmit={(values) => console.log(values)}
     >
       {({ values }) => (
        <Form>
          <FieldArray
            name="users"
            render={(arrayHelpers) => (
              <div>
                {values.users.map((user, index) => (
                  <div key={index}>
                    <label>
                      Name
                      <Field name={`users.${index}.name`} />
                    </label>
                    <button
                      type="button"
                      onClick={() => arrayHelpers.remove(index)} // remove a friend from the list
                    >
                      Remove User
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => arrayHelpers.push({ name: "", id: ++id })}
                >
                  Add user
                </button>
                <button type="submit">Submit</button>
              </div>
            )}
          />
        </Form>
      )}
    </Formik>
  </div>
);
```

> You may notice that we're using `arrayHelpers.push` and `arrayHelpers.remove` instead of simply doing `values.push`. This is because if we do a `values.push` command, it won't trigger a re-render.

Because we're now using an array, we need a unique ID for each user. This is why, for each implementation, there's an `id` field. [We then use this `id` field to identify which user is which to the framework](/posts/ffg-fundamentals-dynamic-html#keys).

<iframe data-frame-title="Form Arrays - StackBlitz" src="pfp-code:./form-arrays-4?template=node&embed=1&file=src%2FApp.jsx"></iframe>

# Form Validation {#form-validation}

Formik allows you to pass a function to the `Field` component in order to `validate` the data input. Here, we can simply check if `value` is present or not. Then, we can check against the `Formik` component's `errors` field to see if the `name` field has any errors. 

```jsx
function requiredField(value) {
  let error;
  if (!value) {
    error = 'Required';
  }
  return error;
}

const FormComp = () => {
  return (
    <Formik initialValues={{ name: '' }} onSubmit={(val) => console.log(val)}>
      {({ errors, touched }) => (
        <Form>
          <div>
            <Field name="name" validate={requiredField} />
          </div>
          {errors.name && touched && <div>{errors.name}</div>}
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};
```

<iframe data-frame-title="Form Validation - StackBlitz" src="pfp-code:./form-validation-5?template=node&embed=1&file=src%2FApp.jsx"></iframe>

## Complex Data Schema

Formik's `validate` function passing works quite well for basic usage. That said, let's introduce a better way to do form validation that scales a little better when dealing with more complex data.

There are multiple different libraries that will integrate with Formik to add dedicated complex validation functionality. [`yup` is one such library](https://github.com/jquense/yup).

By using `yup`, you're able to replace our home-grown function with something as simple as `yup.string().required()` to mark the field as required.

Yup works by introducing the concept of a "schema" into form validation. You start by declaring a schema that's then validated against using the `validationSchema` in the `Formik` component.

```jsx
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';

const FormSchema = yup.object().shape({
  name: yup.string().required(),
});

const FormComponent = () => {
  return (
    <Formik
      initialValues={{
        name: '',
      }}
      validationSchema={FormSchema}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      {({ errors }) => (
        <Form>
          <div>
            <label>
              Name
              <Field type="text" name="name" />
            </label>
            {errors.name && <p>{errors.name}</p>}
          </div>
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};
```

<iframe data-frame-title="Complex Data Schema - StackBlitz" src="pfp-code:./complex-data-schema-6?template=node&embed=1&file=src%2FApp.jsx"></iframe>

While Yup will generate an error message based on the expected and received data types, we're also able to customize the error message ourselves:

```javascript
const FormSchema = yup.object().shape({
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

```jsx
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';

const FormSchema = yup.object().shape({
  minLenStr: yup.string().min(3),
  maxLenStr: yup.string().max(3),
  regex: yup.string().matches(/hello|hi/i),
  pass: yup.string(),
  confirm: yup
    .string()
    .oneOf([yup.ref('pass'), null], 'Must match "password" field value'),
});

const FormComponent = () => {
  return (
    <Formik
      initialValues={{
        name: '',
      }}
      validationSchema={FormSchema}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      {({ errors }) => (
        <Form>
          <div>
            <label>
              Minimum Length String (3)
              <Field type="text" name="minLenStr" />
            </label>
            {errors.minLenStr && <p>{errors.minLenStr}</p>}
          </div>
          <div>
            <label>
              Maximum Length String (3)
              <Field type="text" name="maxLenStr" />
            </label>
            {errors.maxLenStr && <p>{errors.maxLenStr}</p>}
          </div>
          <div>
            <label>
              Regex
              <Field type="text" name="regex" />
            </label>
            {errors.regex && <p>{errors.regex}</p>}
          </div>
          <div>
            <label>
              Password
              <Field type="password" name="pass" />
            </label>
          </div>
          <div>
            <label>
              Password Confirm
              <Field type="password" name="confirm" />
            </label>
            {errors.confirm && <p>{errors.confirm}</p>}
          </div>
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};
```

<iframe data-frame-title="Validation Types - StackBlitz" src="pfp-code:./validation-types-7?template=node&embed=1&file=src%2FApp.jsx"></iframe>

# Non-Text Form Fields

Some form fields, like checkboxes, may not reflect their UI in a text-based form.

Luckily, Formik allows you to easily cast a `Field` component to a different `type` to display a different base input UI. This is the same as how the `input` element works.

```jsx
const FormSchema = yup.object().shape({
  termsAndConditions: yup
    .bool()
    .oneOf([true], 'You need to accept the terms and conditions'),
});

const FormComponent = () => {
  return (
    <Formik
      initialValues={{
        termsAndConditions: false,
      }}
      validationSchema={FormSchema}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      {({ errors }) => (
        <Form>
          <div>
            <label>
              Terms and conditions
              <Field type="checkbox" name="termsAndConditions" />
            </label>
            {errors.termsAndConditions && <p>{errors.termsAndConditions}</p>}
          </div>
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};
```

> Something worth mentioning in terms of validation is how Formik integrates with Yup; we can't simply mark our `termsAndConditions` field as `required`. Instead, we have to tell `yup` that it has to be `oneOf([true])` to enforce the checkbox to be `true`.

<iframe data-frame-title="Non-Text Form Fields - StackBlitz" src="pfp-code:./non-text-form-fields-8?template=node&embed=1&file=src%2FApp.jsx"></iframe>

# Conclusion

Formik is a powerful library that simplifies form handling in React. From basic form setup to complex validation and array handling, Formik provides a comprehensive set of tools to manage form state, validation, and submission. Whether you prefer using hooks or components, Formik has you covered.

If you enjoyed this article, you might also like [my book series "The Framework Field Guide" that teaches React, Angular, and Vue for free.](https://framework.guide)

Happy coding!
