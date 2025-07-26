import {defineStore} from "pinia";
import {ref} from "vue";
import {usePage} from "@inertiajs/vue3";
import StopInterface from "@/interfaces/stopInterface";
import TripInterface from "@/interfaces/tripInterface";
import UserInterface from "@/interfaces/userInterface";
import {useTripApi} from "@/services/api/tripApiService";

export const useTripFormStore = defineStore('tripForm', () => {
    const { getStop } = useTripApi();

    const trip = ref<TripInterface>({// TODO: Use TripFormInterface
        label: null,
        description: null,
        distance: null,
        duration: null,
        isPublic: false,
        geojson: null,
        stops: [
            {
                arrival_date: null,
                departure_date: null,
                description: null,
                duration: null,
                label: null,
                latitude: null,
                longitude: null,
                order_index: 1,
                trip_id: null,
                notes: [
                    {
                       user_id: null,
                       stop_id: null,
                       content: null,
                    }
                ],
                marker: {},
            },
        ],
        author: null,
        participants: [],
    });

    const isLoading: boolean = ref(false);
    const page = usePage();

    function addStop(stopData: StopInterface) {
        // If it's the first "real" stop. Update the existing placeholder.
        if (trip.value.stops.length === 1 && trip.value.stops[0].label === null && trip.value.stops[0].latitude === null) {
            const firstStop = trip.value.stops[0];
            Object.assign(firstStop, {
                ...stopData,
                order_index: 1, // First stop always has order_index 1
            });
            if (stopData.markers) {
                firstStop.markers = stopData.markers;
            }
        } else {// For all subsequent stops, push them into the array
            stopData.order_index = trip.value.stops.length + 1;
            if (!stopData.label) {
                stopData.label = `Destination ${stopData.order_index + 1}`;
            }
            trip.value.stops.push(stopData);
        }
    }

    function removeStop(stopToRemove: StopInterface) {
        trip.value.stops = trip.value.stops.filter(stop =>
            !(stop.latitude === stopToRemove.latitude && stop.longitude === stopToRemove.longitude)
        );

        trip.value.stops.forEach((stop, index) => {
            stop.order_index = index + 1;
        });
    }

    /**
     * Updates the order of trip stops based on a reordered list of local stops.
     * For each stop in the reordered list, this function finds the corresponding original stop
     * in the store, updates its `order_index` and reorders it.
     *
     * @param reorderedLocalStops
     */
    function updateStopOrder(reorderedLocalStops: StopInterface[]) {
        trip.value.stops = reorderedLocalStops.map((reorderedStop: StopInterface, index: number) => {
            const originalStop = trip.value.stops.find(s =>
                s.latitude === reorderedStop.latitude &&
                s.longitude === reorderedStop.longitude &&
                s.label === reorderedStop.label
            );

            if (originalStop) {
                originalStop.order_index = index + 1;
            } else {
                console.warn('Stop not found in trip store:', reorderedStop);
            }

            return originalStop;
        });
    }

    function addParticipant(friend: UserInterface, permission: string) {
        const alreadyExists = trip.value.participants.some(
            participant => participant.user_id === friend.id
        );

        if (alreadyExists) return;

        trip.value.participants.push(
            {
                user_id: friend.id,
                user_pseudo: friend.pseudo,
                permission: permission
            }
        );
    }

    function updateParticipantPermission(participantId: string, newPermission: string) {
        trip.value.participants.forEach((participant) => {
            if (participant.user_id === participantId) {
                participant.permission = newPermission;
            }
        })
    }

    function addGeoJson(geoJsonData) {
        trip.value.geojson = geoJsonData;
        trip.value.distance = Math.round(geoJsonData.features[0].properties.summary.distance);
        trip.value.duration = Math.round(geoJsonData.features[0].properties.summary.duration);
    }

    function removeGeoJson() {
        trip.value.geojson = null;
    }

    function setAuthor(userId: string) {
        trip.value.author = `/api/users/${userId}`;
    }

    function updateStopDates(date, field: string, stopConcern: StopInterface) {
        trip.value.stops.forEach((stop: StopInterface) => {
            if (stop.longitude === stopConcern.longitude && stop.latitude === stopConcern.latitude) {
                if (field === 'arrival_date') {
                    stop.arrival_date = date;
                } else if (field === 'departure_date') {
                    stop.departure_date = date;
                }
            }
        })
    }

    function updateStopLabel(newLabel: string, stopConcern: StopInterface) {
        trip.value.stops.forEach((stop: StopInterface) => {
            if (stop.longitude === stopConcern.longitude && stop.latitude === stopConcern.latitude) {
                stop.label = newLabel;
            }
        })
    }

    async function setTrip(newTrip: TripInterface) {
        newTrip.geojson = JSON.parse(newTrip.geojson);

        for (const stop of newTrip.stops) {
            stop.markers = [];
            stop.notes = [];
            const stopData = await getStop(stop.id);
            stop.notes.push(stopData);
        }

        const participants = [];
        newTrip.participantsList.forEach((participant) => {
            participants.push({
                user_id: participant.id,
                user_pseudo: participant.pseudo,
                permission: participant.permission
            })
        })
        newTrip.participants = participants;

        trip.value = newTrip;
    }

    return {
        // States
        trip,

        // Actions
        setTrip,
        setAuthor,
        addStop,
        removeStop,
        updateStopOrder,
        addGeoJson,
        removeGeoJson,
        addParticipant,
        updateParticipantPermission,
        updateStopDates,
        updateStopLabel,
    }
})
