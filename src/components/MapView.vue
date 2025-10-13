<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import {
    LMap,
    LTileLayer,
    LGeoJson,
    LMarker,
  } from '@vue-leaflet/vue-leaflet';
  import type {
    FeatureCollection,
    Point,
    LineString,
    Polygon,
    Geometry,
    GeoJSON,
  } from 'geojson';
  import { geoJsonService } from '../services/GeoJsonService';
  import { StyleService } from '../services/StyleService';
  import type { MarkerData } from '../types/Marker';

  let zoom = ref(13);
  let center = ref([47.27597672492266, 11.447581071406603]);

  const geoJsonData = ref<FeatureCollection[]>([]);
  const geoMarkers = ref<MarkerData[]>([]);
  const geoJsonStyle = (feature?: GeoJSON.Feature): L.PathOptions => {
    const color = feature?.properties?.color || '#33eedd';
    return {
      color: color,
      weight: 3,
      opacity: 0.5,
    };
  };

  onMounted(async () => {
    // Load all GeoJSON data
    const geoJsons = await geoJsonService.loadAll();
    geoJsonData.value = geoJsons;

    // Loop through each GeoJSON and create markers at the starting points
    geoJsons.forEach((geoJson, index) => {
      const color = StyleService.generateRandomColor(40, 60, 0.7);

      // Check if features exist and have a valid starting point
      if (geoJson.features && geoJson.features.length) {
        const firstFeature = geoJson.features[0];

        if (
          firstFeature &&
          firstFeature.geometry &&
          hasCoordinates(firstFeature.geometry)
        ) {
          const startPoint = firstFeature.geometry?.coordinates[0];

          if (firstFeature.properties) {
            firstFeature.properties.color = color;
          }

          // Ensure startPoint exists
          if (isValidLatLngArray(startPoint)) {
            // Create a marker at the starting point
            geoMarkers.value.push({
              latLng: [startPoint[1], startPoint[0]],
              color: color,
              pathIndex: index + 1, // Optional: Index or name of the path
            });
          }
        }
      }
    });
  });

  // Helper function to get a custom marker icon based on the color
  const getMarkerIcon = (color: string) => {
    return new L.DivIcon({
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%;"></div>`,
      className: 'leaflet-div-icon',
    }) as L.Icon<L.IconOptions>;
  };

  // This function checks if the geometry is of a type that has coordinates
  const hasCoordinates = (
    geometry: Geometry,
  ): geometry is Point | LineString | Polygon => {
    return 'coordinates' in geometry;
  };

  // Type guard for checking if the array contains numbers
  function isValidLatLngArray(arr: any): arr is [number, number, number?] {
    return (
      Array.isArray(arr) &&
      arr.length === 3 &&
      typeof arr[0] === 'number' &&
      typeof arr[1] === 'number' &&
      !isNaN(arr[0]) &&
      !isNaN(arr[1]) &&
      (typeof arr[2] === 'number' || arr[2] === undefined) // Optional: check the third value
    );
  }
</script>

<template>
  <main>
    <LMap
      v-model:zoom="zoom"
      v-model:center="center"
      :use-global-leaflet="false"
    >
      <LTileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        layer-type="base"
        name="Stadia Maps Basemap"
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      />
      <LMarker
        v-for="(marker, index) in geoMarkers"
        :key="index"
        :lat-lng="marker.latLng"
        :icon="getMarkerIcon(marker.color)"
      >
        <template #tooltip>
          {{ marker.pathIndex }}
        </template>
      </LMarker>
      <LGeoJson
        v-for="(geojson, index) in geoJsonData"
        :key="index"
        :geojson="geojson"
        :optionsStyle="geoJsonStyle(geojson.features.at(0))"
      >
        <template #tooltip>
          {{ geojson.features.at(0)?.properties?.name }}
        </template>
      </LGeoJson>
    </LMap>
  </main>
</template>

<style scoped>
  main {
    width: 100%;
    height: 100vh;
  }
</style>
