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
