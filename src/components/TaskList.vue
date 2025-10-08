<script lang="ts" setup>
import type { Task } from '../types/Task';

const props = defineProps<{
    tasks: Task[],
}>();
</script>

<template>
    <ul>
      <li 
        v-for="task in props.tasks" 
        :key="task.id" 
        class="flex items-center gap-2">
        <Checkbox 
            v-model="task.isComplete" 
            :input-id="task.id"
            :name="task.title"
            :value="task.title"
            :checked="task.isComplete"
            indeterminate
            binary />
        <label 
            :for="task.id">
            {{ task.title }}
        </label>
      </li>
    </ul>
</template>