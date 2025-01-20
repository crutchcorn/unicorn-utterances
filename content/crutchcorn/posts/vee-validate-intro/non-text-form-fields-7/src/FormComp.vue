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
