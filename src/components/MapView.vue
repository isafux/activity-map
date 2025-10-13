<script lang="ts" setup>
  import { onMounted, ref } from "vue";
  import type { FeatureCollection } from 'geojson';
  import "leaflet/dist/leaflet.css";
  import { LMap, LTileLayer, LMarker, LGeoJson } from "@vue-leaflet/vue-leaflet";

  import arcades from "../assets/arcades.json";

  let zoom = ref(12);
  let center = ref([47.27597672492266, 11.447581071406603]);

  const geoJsonFiles = ref<string[]>([]);
  const geoJsonData = ref<FeatureCollection[]>([]);
  const geoJson = ref<FeatureCollection | null>(null);
  const geoJsonStyle = {
    color: '#22ddee',
    weight: 3,
    opacity: 0.8
  };
  const geoJsonStyle2 = {
    color: '#aa33dd',
    weight: 3,
    opacity: 0.5
  };

  onMounted(async () => {
    try {
      const response = await fetch(
        '/geojson/20624896341.geojson'
      );
      if (!response.ok) {
        throw new Error(`Failed to load GeoJSON: ${response.statusText}`);
      }
      geoJson.value = await response.json() as FeatureCollection;
    } catch (error) {
      console.error('Error loading GeoJSON:', error);
    }

    // Load the manifest file listing all GeoJSON filenames
    const res = await fetch("/geojson/geojson-list.json");
    if (!res.ok) {
      console.error("Failed to load GeoJSON list manifest");
      return;
    }
    geoJsonFiles.value = await res.json();
    console.log(geoJsonFiles.value);
    

    // Load all GeoJSON files concurrently
    const loadedGeoJsons = await Promise.all(
      geoJsonFiles.value.map(file => loadGeoJsonFile(file))
    );

    // Filter out failed loads
    geoJsonData.value = loadedGeoJsons.filter((g): g is FeatureCollection => !!g);
  });

  async function loadGeoJsonFile(filename: string) {
    try {
      const res = await fetch(`/geojson/${filename}`);
      if (!res.ok) throw new Error(`Failed to load ${filename}`);
      return await res.json() as FeatureCollection;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  function fixCoordinateOrder(featureCollection: FeatureCollection): FeatureCollection {
    return {
      ...featureCollection,
      features: featureCollection.features.map((feature) => {
        if (feature.geometry.type === "LineString") {
          return {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: feature.geometry.coordinates.map(([a, b, z]) => [b, a]) // swap lat/lng
            }
          };
        }
        return feature;
      })
    };
  }
</script>

<template>
  <main>
    <LMap v-model:zoom="zoom" v-model:center="center" :use-global-leaflet="false">
      <LTileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                  layer-type="base"
                  name="Stadia Maps Basemap"
                  attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      />
      <LMarker :lat-lng="[47.27597672492266, 11.447581071406603]" />
      <LGeoJson v-if="geoJson" :geojson="geoJson" :optionsStyle="geoJsonStyle"></LGeoJson>
      <LGeoJson
        v-for="(geojson, index) in geoJsonData"
        :key="index"
        :geojson="geojson"
        :optionsStyle="geoJsonStyle2"
      />
    </LMap>
  </main>
</template>
  <!-- <LMarker v-for="arcade in arcades.features.slice(0,150)" :lat-lng="arcade.geometry.coordinates.reverse()"></LMarker> -->

<style scoped>
    main {
      width: 100%;
      height: 100vh;
    }
</style>