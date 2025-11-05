<script async setup lang="ts">
  import ProgressSpinner from 'primevue/progressspinner';
  import { computed } from 'vue';
  import { FormatService } from '../services/FormatService';

  const { activityTypes = new Set() } = defineProps<{
    activityTypes: Set<string>;
  }>();

  const selectedActivityTypes = defineModel<string[]>('selectedActivityTypes');

  const checkAllActivityTypes = computed({
    get() {
      if (selectedActivityTypes.value !== undefined) {
        return (
          activityTypes.size > 0 &&
          selectedActivityTypes.value.length === activityTypes.size
        );
      } else {
        return false;
      }
    },
    set(isChecked) {
      if (isChecked) {
        // If "All" is checked, add all activity types to selectedActivityTypes
        selectedActivityTypes.value = [...activityTypes];
      } else {
        // If "All" is unchecked, clear selectedActivityTypes
        selectedActivityTypes.value = [];
      }
    },
  });
</script>

<template>
  <div class="flex flex-col gap-1 bg-teal-900 rounded-md px-4 py-3">
    <template v-if="activityTypes.size">
      <div class="filter">
        <Checkbox
          :inputId="'checkbox-all'"
          :value="'all'"
          v-model="checkAllActivityTypes"
          binary
          class="mr-2"
        />
        <label :for="'checkbox-all'">All</label>
      </div>
      <template
        v-for="type in activityTypes"
        :key="type"
      >
        <div class="filter">
          <Checkbox
            :inputId="`checkbox-${type}`"
            :value="type"
            v-model="selectedActivityTypes"
            class="mr-2"
          />
          <label
            :for="`checkbox-${type}`"
            class="color-white-100"
            >{{ FormatService.capitalizeFirstLetters(type) }}</label
          >
        </div>
      </template>
    </template>
    <template v-else>
      Loading... <ProgressSpinner aria-label="loading" />
    </template>
  </div>
</template>
^

<style scoped>
  .p-progressspinner {
    width: 30px;
    height: 30px;
  }
</style>
