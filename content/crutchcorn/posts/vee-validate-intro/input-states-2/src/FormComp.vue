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
