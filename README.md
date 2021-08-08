# v-use-places-autocomplete

📍 Vue composable for Google Maps Places Autocomplete.

Though not a fork, this composable is fully inspired by [react-google-places-autocomplete](https://github.com/tintef/react-google-places-autocomplete) and [use-places-autocomplete](https://github.com/wellyshen/use-places-autocomplete).

## Install

```sh
yarn add v-use-places-autocomplete
```

## Example

```html
<!-- Load the library using the script tag -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
```

```html
<template>
  <input type="text" v-model="query" placeholder="Search a place..." />
  <ul>
    <li v-for="item in suggestions" :key="item.place_id" v-text="item.description" />
  </ul>
</template>

<script>
import { defineComponent, ref } from 'vue' // or @vue/composition-api
import usePlacesAutocomplete from 'v-use-places-autocomplete'

export default defineComponent({
  setup() {
    const query = ref('')
    const { suggestions } = usePlacesAutocomplete(query, {
      debounce: 500,
      minLengthAutocomplete: 3
    })

    return {
      query,
      suggestions
    }
  }
})
</script>
```

## API

```js
const {
    suggestions,
    loading,
    sessionToken,
    refreshSessionToken
} = usePlacesAutocomplete(query, options);
```

### Options

| Key | Type | Default | Description |
| :----- | :-------- | :---------- | :---------- |
| `apiKey` | string | `""` | If this parameter is passed, the component will inject the Google Maps JavaScript API using this apiKey. So there's no need to manually add the script tag to your HTML document. |
| `apiOptions` | [object](https://developers.google.com/maps/documentation/javascript/localization) | `{}` | Object to configure the google script to inject. |
| `autocompletionRequest` | [object](https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletionRequest) | `{}` | Autocompletion request object to add restrictions to the search. |
| `debounce` | number | `300` | The number of milliseconds to delay before making a call to Google Maps API. |
| `minLengthAutocomplete` | number | `0` | Defines a minimum number of characters needed on the input in order to make requests to the Google's API. |
| `onLoadFailed` | function | `console.error` | Function to be called when the injection of the Google Maps JavaScript API fails due to network error. |
| `withSessionToken` | boolean | `false` | If this is set to true, the composable will handle changing the sessionToken on every session. To learn more about how this works refer to [Google Places Session Token docs](https://developers.google.com/maps/documentation/places/web-service/session-tokens). |

### Return object

| Key | Type | Default | Description |
| :----- | :-------- | :---------- | :---------- |
| `suggestions` | [array](https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletePrediction) | `[]` | Contains the autocomplete predictions. |
| `loading` | boolean | `false` | Indicates the status of a request is pending or has completed. |
| `sessionToken` | string \| undefined | `undefined` | Current [sessionToken](https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service) being used. |
| `refreshSessionToken` | function | - | This function allows you to refresh the sessionToken being used. |

## Utilities

### getGeocode

Converts an `address` or `location` or `placeId` and optionally `bounds`, `componentRestrictions`, `region`. It'll be passed as [Geocoding Requests](https://developers.google.com/maps/documentation/javascript/geocoding#GeocodingRequests).

```typescript
const parameter = {
  address: "Cebu-Cordova Link Expressway Corp., Antuwanga, Cebu City, Cebu, Philippines",
  // or
  placeId: "ChIJk6_7UFmdqTMRgFAxl4KEnUQ",
};

const results = await getGeocode(parameter);
console.log('Geocoding results: ', results);
```

### getLatLng

Allows to get the latitude and longitude from the result object of `getGeocode`.

```typescript
const parameter = {
  address: "Cebu-Cordova Link Expressway Corp., Antuwanga, Cebu City, Cebu, Philippines",
  // or
  placeId: "ChIJk6_7UFmdqTMRgFAxl4KEnUQ",
};

const results = await getGeocode(parameter);
const latLng = await getLatLng(results[0]);

const { lat, lng } = latLng;
console.log('Coordinates: ', { lat, lng });
```

### Credits

- [react-google-places-autocomplete](https://github.com/tintef/react-google-places-autocomplete) - React component for Google Places Autocomplete.
- [use-places-autocomplete](https://github.com/wellyshen/use-places-autocomplete) - React hook for Google Maps Places Autocomplete.
- [vue-demi](https://github.com/vueuse/vue-demi/) - Creates Universal Library for Vue 2 & 3.
- [vue-use](https://vueuse.org/) - Collection of essential Vue Composition Utilities.

### License

[MIT License](http://opensource.org/licenses/MIT).