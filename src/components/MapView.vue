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

  import type { FeatureCollection, GeoJSON } from 'geojson';
  import { geoJsonService } from '../services/GeoJsonService';
  import { FormatService } from '../services/FormatService';
  import { StyleService } from '../services/StyleService';

  import type { MarkerData } from '../types/Marker';
  import type { TileServerMap } from '../types/TileServerMap';
  import tileServersJSON from '../assets/tileServerURLs.json';
  import type { PointTuple } from 'leaflet';

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
    const activities = await geoJsonService.loadAllGeoJSONs();

    geoActivities.value = activities;
    geoMarkers.value = await geoJsonService.getMarkersAndBindColors(
      activities,
      activityTypes.value,
    );
  });
</script>

<template>
  <div class="tileURL-selection-wrapper absolute bottom-3 eft-3 ml-3 z-401">
    <Select
      v-model="selectedTileKey"
      :options="tileOptions"
      optionLabel="label"
      optionValue="key"
      placeholder="Select Tile Layer"
    >
    </Select>
  </div>
  <div
    class="filter-activity-wrapper absolute top-3 right-3 ml-14 z-401 bg-teal-900 rounded-md p-3 flex flex-wrap gap-4"
  >
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
