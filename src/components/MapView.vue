<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
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
  import { FormatService } from '../services/FormatService';

  import type { MarkerData } from '../types/Marker';

  let zoom = ref(13);
  let center = ref([47.27597672492266, 11.447581071406603]);

  const geoJsonStyle = (feature?: GeoJSON.Feature): L.PathOptions => {
    const color = feature?.properties?.color || '#33eedd';
    return {
      color: color,
      weight: 3,
      opacity: 0.5,
    };
  };

  const geoJsonData = ref<FeatureCollection[]>([]);
  const filteredGeoJsonData = computed<FeatureCollection[]>(() => {
    return geoJsonData.value.filter((geoData) => {
      const type = geoData.features.at(0)?.properties?.type;
      return selectedActivityTypes.value.includes(type);
    });
  });

  const geoMarkers = ref<MarkerData[]>([]);
  const filteredGeoMarkers = computed<MarkerData[]>(() => {
    return geoMarkers.value.filter((marker) => {
      const type = marker.activityType;
      return selectedActivityTypes.value.includes(type);
    });
  });

  const activityTypes = ref<Set<string>>(new Set());
  const selectedActivityTypes = ref<string[]>([]);
  const checkAllActivityTypes = computed({
    get() {
      return (
        activityTypes.value.size > 0 &&
        selectedActivityTypes.value.length === activityTypes.value.size
      );
    },
    set(isChecked) {
      if (isChecked) {
        // If "All" is checked, add all activity types to selectedActivityTypes
        selectedActivityTypes.value = [...activityTypes.value];
      } else {
        // If "All" is unchecked, clear selectedActivityTypes
        selectedActivityTypes.value = [];
      }
    },
  });

  onMounted(async () => {
    const geoJsons = await geoJsonService.loadAll();

    geoJsonData.value = geoJsons;
    geoMarkers.value = await geoJsonService.getMarkersAndBindColors(
      geoJsons,
      activityTypes.value,
    );
  });
</script>

<template>
  <main>
    <div class="filter-activity-wrapper absolute">
      <template
        v-for="type in activityTypes"
        :key="type"
      >
        <Checkbox
          :inputId="`checkbox-${type}`"
          :value="type"
          v-model="selectedActivityTypes"
        />
        <label :for="`checkbox-${type}`">{{ type }}</label>
      </template>
      <Checkbox
        :inputId="'checkbox-all'"
        :value="'all'"
        v-model="checkAllActivityTypes"
        binary
      />
      <label :for="'checkbox-all'">All</label>
    </div>
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
        v-for="(marker, index) in filteredGeoMarkers"
        :key="index"
        :lat-lng="marker.latLng"
        :icon="geoJsonService.getMarkerIcon(marker.color)"
      >
        <LTooltip> {{ marker.pathIndex }} </LTooltip>
      </LMarker>
      <LGeoJson
        v-for="(geojson, index) in filteredGeoJsonData"
        :key="index"
        :geojson="geojson"
        :optionsStyle="geoJsonStyle(geojson.features.at(0))"
      >
        <LTooltip>
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
    height: calc(100vh - 25px);
  }
</style>
