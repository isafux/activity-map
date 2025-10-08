<script lang="ts" setup>
    import { ref } from "vue";
    import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet"
    import "leaflet/dist/leaflet.css";

    import arcades from "../assets/arcades.json";

    let zoom = ref(6);
    let center = ref([38, 139.69]);
</script>

<template>
  <main>
    <h1>My Map</h1>
    <l-map v-model:zoom="zoom" v-model:center="center" :use-global-leaflet="false">
      <l-tile-layer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                    layer-type="base"
                    name="Stadia Maps Basemap"
                    attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      >
      </l-tile-layer>
      <l-marker v-for="arcade in arcades.features.slice(0,10)" :lat-lng="arcade.geometry.coordinates.reverse()"></l-marker>
    </l-map>
  </main>
</template>

<style scoped>
    main {
        height: 100vh;
        width: 100vw;
    }
</style>