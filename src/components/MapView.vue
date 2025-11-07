<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
  import 'leaflet/dist/leaflet.css';
  import {
    LMap,
    LTileLayer,
    LGeoJson,
    LMarker,
    LTooltip,
  } from '@vue-leaflet/vue-leaflet';

  // explicit naming of components for Vue Dev Tools
  LMap.name = 'LMap';
  LTileLayer.name = 'LTileLayer';
  LMarker.name = 'LMarker';
  LTooltip.name = 'LTooltip';
  LGeoJson.name = 'LGeoJson';

  import type { FeatureCollection } from 'geojson';
  import { geoJsonService } from '../services/GeoJsonService';
  import { FormatService } from '../services/FormatService';
  import { StyleService } from '../services/StyleService';

  import type { MarkerData } from '../types/Marker';
  import type { TileServerMap } from '../types/TileServerMap';
  import tileServersJSON from '../assets/tileServerURLs.json';
  import type { PointTuple } from 'leaflet';
  import ActivityFilter from './ActivityFilter.vue';

  const tileServers = tileServersJSON as TileServerMap;
  const tileOptions = Object.entries(tileServers).map(([key, url]) => ({
    key,
    label: FormatService.formatLabel(key),
    url,
  }));

  // Map default settings
  let zoom = ref(13);
  let center = ref([47.27597672492266, 11.447581071406603] as PointTuple);
  const selectedTileKey = ref(Object.keys(tileServers)[0] ?? '');
  const currentTileUrl = computed(
    () => tileServers[selectedTileKey.value] ?? '',
  );

  // Activity paths + style
  const geoActivities = ref<FeatureCollection[]>([]);
  const filteredGeoJsonData = computed<FeatureCollection[]>(() => {
    return geoActivities.value.filter((geoData) => {
      const type = geoData.features.at(0)?.properties?.type;
      return selectedActivityTypes.value.includes(type);
    });
  });

  // Activity markers at starting point
  const geoMarkers = ref<MarkerData[]>([]);
  const filteredGeoMarkers = computed<MarkerData[]>(() => {
    return geoMarkers.value.filter((marker) => {
      const type = marker.activityType;
      return selectedActivityTypes.value.includes(type);
    });
  });

  // Activity filters
  const activityTypes = ref<Set<string>>(new Set());
  const selectedActivityTypes = ref<string[]>([]);

  onMounted(async () => {
    const activities = await geoJsonService.loadAllGeoJSONs();

    geoActivities.value = activities;
    geoMarkers.value = await geoJsonService.extractActivityData(
      activities,
      activityTypes.value,
    );
  });
</script>

<template>
  <div class="map-selection-wrapper absolute bottom-3 left-3 ml-3 z-401">
    <Select
      v-model="selectedTileKey"
      :options="tileOptions"
      optionLabel="label"
      optionValue="key"
      placeholder="Select Tile Layer"
    >
    </Select>
  </div>

  <div class="activity-filter-wrapper absolute top-3 right-3 ml-14 z-401">
    <ActivityFilter
      :activity-types="activityTypes"
      v-model:selected-activity-types="selectedActivityTypes"
    />
  </div>

  <main>
    <LMap
      v-model:zoom="zoom"
      v-model:center="center"
      :use-global-leaflet="false"
    >
      <LTileLayer
        :url="currentTileUrl"
        layer-type="base"
        name="TileLayer"
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
        :optionsStyle="StyleService.geoActivityStyle(geojson.features.at(0))"
      >
        <LTooltip>
          <div class="tooltip-content px-2 py-1">
            <h3 class="font-bold text-sm mb-1">
              {{ geojson.features.at(0)?.properties?.name }}
            </h3>
            <p>
              {{
                FormatService.formatDate(
                  geojson.features.at(0)?.properties?.time,
                  'de-DE',
                )
              }}
            </p>
          </div>
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
