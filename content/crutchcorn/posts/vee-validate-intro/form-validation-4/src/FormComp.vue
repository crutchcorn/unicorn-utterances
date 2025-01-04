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
