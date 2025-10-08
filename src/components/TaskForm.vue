<script lang="ts" setup>
import { ref } from 'vue';

const emit = defineEmits<{
    addTask: [newTask: string]
}>();

const newTask = ref("");
let error = ref("");

function formSubmitted() {
  if (newTask.value.trim()) {
    emit("addTask", newTask.value.trim());
    newTask.value = "";
  }
  else {
    error.value = "Title must not be empty!";
  }
}
</script>

<template>
  <h1 class="text-2xl font-bold mb-5">Task Manager</h1>
    <form @submit.prevent="formSubmitted">
      <label class="mr-2">
        <InputText 
          v-model="newTask" 
          name="newTask" 
          placeholder="My new task"
          :aria-invalid="!!error || undefined"
          @input="error = ''" />
      </label>
      
      <Button 
        type="submit"
        icon="pi pi-plus" 
        aria-label="add" />
        
      <Message 
        v-if="error"
        severity="error"
        size="small"
        variant="simple">
        {{ error }}
      </Message>
    </form>
</template>