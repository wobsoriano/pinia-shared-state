import { ref } from 'vue';
import { loadEnv } from 'vite';
import { mountComposition } from 'vue-composition-test-utils'
import usePlacesAutocomplete from '../src'

const mockFetchingData = () => new Promise(res => setTimeout(res, 1000));
const mockSuggestionsData = [
    {
        "description": "Manila, Metro Manila, Philippines",
        "matched_substrings": [
            {
                "length": 6,
                "offset": 0
            }
        ],
        "place_id": "ChIJi8MeVwPKlzMRH8FpEHXV0Wk",
        "reference": "ChIJi8MeVwPKlzMRH8FpEHXV0Wk",
        "structured_formatting": {
            "main_text": "Manila",
            "main_text_matched_substrings": [
                {
                    "length": 6,
                    "offset": 0
                }
            ],
            "secondary_text": "Metro Manila, Philippines"
        },
        "terms": [
            {
                "offset": 0,
                "value": "Manila"
            },
            {
                "offset": 8,
                "value": "Metro Manila"
            },
            {
                "offset": 22,
                "value": "Philippines"
            }
        ],
        "types": [
            "locality",
            "political",
            "geocode"
        ]
    }
]

const apiKey = loadEnv('', process.cwd()).VITE_PLACES_API_KEY

type Suggestions = google.maps.places.AutocompletePrediction[] | null;

describe('usePlacesAutocomplete', () => {
    const getMaps = (type: 'success' | 'fail', data: Suggestions = null): any => ({
        maps: {
            places: {
                AutocompleteService: jest.fn(() => ({
                    getPlacePredictions: (_: any, cb: (dataArg: Suggestions) => void) => {
                        setTimeout(() => {
                            cb(type === 'success' ? data : null);
                        }, 500)
                    }
                })),
                AutocompleteSessionToken: jest.fn()
            },
        },
    });
    
    it('should return initial object', () => {
        global.google = getMaps('success');

        const query = ref('')
        const { result } = mountComposition(() => usePlacesAutocomplete(query, {
            apiKey
        }))

        expect(result?.current?.suggestions.value).toEqual([]);
        expect(result?.current?.loading.value).toEqual(false);
        expect(result?.current?.sessionToken.value).toEqual({});
        expect(typeof result?.current?.refreshSessionToken).toBe('function');
    });

    it('should return correct suggestions', async () => {
        global.google = getMaps('success', mockSuggestionsData);

        const query = ref('');
        const { result } = mountComposition(() => usePlacesAutocomplete(query, {
            apiKey
        }))
        
        query.value = 'manila';
        await mockFetchingData();
        expect(result?.current?.suggestions.value).toEqual(mockSuggestionsData);

        query.value = '';
        await mockFetchingData();
        expect(result?.current?.suggestions.value).toEqual([]);
    });

    it('should throw error when no Places API and apiKey provided', () => {
        console.error = jest.fn();
        const query = ref('');

        // @ts-ignore
        delete global.google.maps.places;
        mountComposition(() => usePlacesAutocomplete(query));
        expect(console.error).toHaveBeenCalledTimes(1);

        // @ts-ignore
        delete global.google.maps;
        mountComposition(() => usePlacesAutocomplete(query));
        expect(console.error).toHaveBeenCalledTimes(2);

        // @ts-ignore
        delete global.google;
        mountComposition(() => usePlacesAutocomplete(query));
        expect(console.error).toHaveBeenCalledTimes(3);

        expect(console.error).toHaveBeenCalledWith('[v-use-places-autocomplete]: Google maps places script not loaded');
        expect(console.error).toHaveBeenCalledWith('[v-use-places-autocomplete]: Google maps script not loaded');
        expect(console.error).toHaveBeenCalledWith('[v-use-places-autocomplete]: Google script not loaded');
    });
});