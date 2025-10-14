<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import {
    LMap,
    LTileLayer,
    LGeoJson,
    LMarker,
    LTooltip,
  } from '@vue-leaflet/vue-leaflet';
  import type { FeatureCollection, GeoJSON } from 'geojson';
  import { geoJsonService } from '../services/GeoJsonService';
  import { StyleService } from '../services/StyleService';
  import { FormatService } from '../services/FormatService';
  import { GuardService } from '../services/GuardService';

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
          GuardService.hasCoordinates(firstFeature.geometry)
        ) {
          const startPoint = firstFeature.geometry?.coordinates[0];

          if (firstFeature.properties) {
            firstFeature.properties.color = color;
          }

          // Ensure startPoint exists
          if (GuardService.isValidLatLngArray(startPoint)) {
            // Create a marker at the starting point
            geoMarkers.value.push({
              latLng: [startPoint[1], startPoint[0]],
              color: color,
              pathIndex: firstFeature.properties?.name, // Optional: Index or name of the path
            });
          }
        }
      }
    });
  });
</script>

<template>
  <main>
    <!-- <checkbox v-for="value in source">{{  }}</checkbox> -->
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
        :icon="geoJsonService.getMarkerIcon(marker.color)"
      >
        <LTooltip> {{ marker.pathIndex }} </LTooltip>
      </LMarker>
      <LGeoJson
        v-for="(geojson, index) in geoJsonData"
        :key="index"
        :geojson="geojson"
        :optionsStyle="geoJsonStyle(geojson.features.at(0))"
      >
        <LTooltip>
          <h2>
            {{
              FormatService.capitalizeFirstLetter(
                geojson.features.at(0)?.properties?.type,
              )
            }}
          </h2>
          <p>{{ geojson.features.at(0)?.properties?.name }}</p>
          <p>
            {{
              FormatService.formatDate(
                geojson.features.at(0)?.properties?.time,
                'de-DE',
              )
            }}
          </p>
        </LTooltip>
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
