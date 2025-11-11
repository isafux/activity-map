<script lang="ts" setup>
  import { RouterLink } from 'vue-router';
  import Menu from 'primevue/menu';
  import type { MenuItem } from 'primevue/menuitem';
  import { ref, type Ref } from 'vue';

  const menuItems: Ref<MenuItem[]> = ref([
    {
      label: 'Home',
      icon: 'pi pi-home',
      route: '/',
    },
    {
      label: 'Tasks',
      icon: 'pi pi-check-circle',
      route: '/tasks',
    },
    {
      label: 'Activity Map',
      icon: 'pi pi-map',
      route: '/map',
    },
  ]);

  const menu = ref();

  const toggleMenu = (event: any) => {
    menu.value.toggle(event);
  };
</script>

<template>
  <nav class="absolute top-3 left-15 z-401">
    <Button
      type="button"
      icon="pi pi-bars"
      @click="toggleMenu"
      aria-haspopup="true"
      aria-controls="overlay_menu"
    />
    <Menu
      ref="menu"
      :model="menuItems"
      :popup="true"
    >
      <template #item="{ item, props }">
        <router-link
          v-if="item.route"
          v-slot="{ href, navigate }"
          :to="item.route"
          custom
        >
          <a
            v-ripple
            :href="href"
            v-bind="props.action"
            @click="navigate"
          >
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
      </template>
    </Menu>
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<style scoped></style>
