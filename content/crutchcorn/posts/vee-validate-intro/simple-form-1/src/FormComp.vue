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
