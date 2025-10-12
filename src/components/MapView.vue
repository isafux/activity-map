<script lang="ts" setup>
    import { ref } from "vue";
    import "leaflet/dist/leaflet.css";
    import { LMap, LTileLayer, LMarker, LGeoJson } from "@vue-leaflet/vue-leaflet";

    import arcades from "../assets/arcades.json";

    let zoom = ref(6);
    let center = ref([38, 139.69]);
</script>

<template>
  <main>
    <h1>My Map</h1>
    <LMap v-model:zoom="zoom" v-model:center="center" :use-global-leaflet="false">
      <LTileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                    layer-type="base"
                    name="Stadia Maps Basemap"
                    attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      />
      <LMarker v-for="arcade in arcades.features.slice(0,150)" :lat-lng="arcade.geometry.coordinates.reverse()"></LMarker>
      <LGeoJson></LGeoJson>
    </LMap>
  </main>
</template>

<style scoped>
    main {
        height: 100vh;
        width: 100vw;
    }
</style>