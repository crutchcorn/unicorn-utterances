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
