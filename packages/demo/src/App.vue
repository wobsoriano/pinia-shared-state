<template>
  <input type="text" v-model="query" placeholder="Search a place..." />
  <div v-show="loading">Loading...</div>
  <ul>
    <li v-for="item in suggestions" :key="item.place_id" v-text="item.description" />
  </ul>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'v-use-places-autocomplete'

const query = ref('manila')
const { suggestions, loading } = usePlacesAutocomplete(query, {
  apiKey: import.meta.env.VITE_PLACES_API_KEY as string,
  minLengthAutocomplete: 2
})

watchEffect(async () => {
  if (suggestions.value.length) {
    const geocode = await getGeocode({
      placeId: suggestions.value[0].place_id
    });
    console.log('getGeocode result: ', geocode)
    const latLng = await getLatLng(geocode[0]);
    console.log('getLatLng result: ', latLng);
  }
})
</script>