import {defineStore} from "pinia";
import {ref} from "vue";
import TripInterface from "@/interfaces/tripInterface";

export const useTripStore = defineStore('trip', () => {
    const trips: TripInterface[] | [] = ref([]);

    function setTrips(tripData: TripInterface[]) {
        trips.value = tripData;
    }

    function addTrip(newTrips: TripInterface[]): void {
        trips.value.push(...newTrips);
    }

    return {
        // States
        trips,

        // Actions
        setTrips,
        addTrip,
    }
});
