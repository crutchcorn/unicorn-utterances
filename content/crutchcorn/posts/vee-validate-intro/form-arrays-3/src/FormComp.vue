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
