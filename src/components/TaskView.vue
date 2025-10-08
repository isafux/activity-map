<script lang="ts" setup>
    import { computed, ref } from 'vue';
    import TaskForm from './TaskForm.vue';
    import type { Task } from '../types/Task';
    import TaskList from './TaskList.vue';

    const tasks = ref<Task[]>([]);
    const message = ref("Hello Isa!");
    const completedCount = computed(() => {
    return tasks.value.filter(t => t.isComplete).length;
    });

    function addTask(newTask: string) {
    tasks.value.push({
        id: crypto.randomUUID(),
        title: newTask,
        isComplete: false,
    });
    }
</script>

<template>
  <main class="min-h-screen flex justify-center items-center">
    <div class="h-70 flex flex-col justify-between"> 
      <h2 class="mb-10"  >{{ message }}</h2> 
      <TaskForm @add-task="addTask" />
      <h3 class="mt-5 mb-3">I have {{ tasks.length }} tasks to do.</h3>
      <TaskList :tasks/>
      <h3 class="mt-3 mb-10">{{ completedCount }} tasks are completed!</h3>
      <h3>Are you happy now?</h3>
    </div>
  </main>
</template>