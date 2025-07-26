<script setup lang="ts">

import {usePage} from "@inertiajs/vue3";
import Navbar from "@/components/Navbar.vue";
import {MapPin} from "lucide-vue-next";
import {useUserStore} from "@/stores/userStore";
import {storeToRefs} from "pinia";
import {ref, watch} from "vue";
import TripCard from "@/components/Trip/Cards/TripCard.vue";
import {useTripStore} from "@/stores/tripStore";
import axios from "axios";
import HeroBannerButton from "@/components/HeroBannerButton.vue";
import {useI18n} from "vue-i18n";
import TripInterface from "@/interfaces/tripInterface";
import Footer from "@/components/Footer.vue";
import TripCardSkeleton from "@/components/Trip/Cards/TripCardSkeleton.vue";
import UserInterface from "@/interfaces/userInterface";
import {useTripApi} from "@/services/api/tripApiService";
import {useUserApi} from "@/services/api/userApiService";

const page = usePage()
const {t} = useI18n();

const userStore = useUserStore();
const tripStore = useTripStore();

const { user } = storeToRefs(userStore);
const { trips } = storeToRefs(tripStore);

const isReady = ref<boolean>(false);

const {
    getTripsByParticipant,
    loading: tripParticipantsLoading,
    validationErrors: tripParticipantsValidationErrors,
    error: tripParticipantsError
} = useTripApi()

const {
    fetchUser,
    loading: userLoading,
    error: userError,
    validationErrors: userValidationErrors
} = useUserApi()

async function getMissingTrips(missingTripUrls: string[]): Promise<TripInterface[]> {
    const newTripsData: TripInterface[] = [];

    for (const url of missingTripUrls) {
        const response = await axios.get(url);
        const author = await getAuthorInfos(response.data);

        response.data.author = {
            id: author.id,
            pseudo: author.pseudo,
            email: author.email,
        };
        newTripsData.push(response.data);
    }
    return newTripsData;
}

async function getMissingTripsWhereUserIsParticipant(): Promise<TripInterface[]> {
    const trips = await getTripsByParticipant(user.value?.id)

    for (const trip of trips) {
        const author = await getAuthorInfos(trip);
        trip.author = {
            id: author.id,
            pseudo: author.pseudo,
            email: author.email,
        };
    }

    return trips;
}

async function getAuthorInfos(trip: TripInterface): UserInterface {
    const authorId = trip.author ? trip.author.split('/').pop() : trip.author_id.split('/').pop();

    if (user.value && authorId !== user.value.id) {
        return await fetchUser(trip.author_id)
    } else {
        return user.value;
    }
}

watch(
    () => user.value?.trips,
    async (newTrips) => {
        if (!newTrips) return;
        isReady.value = false;

        const tripsUserParticipant = await getMissingTripsWhereUserIsParticipant();
        const missingTrips = await getMissingTrips(newTrips);

        const newTripsData: TripInterface[] = [
            ...tripsUserParticipant,
            ...missingTrips,
        ];

        tripStore.setTrips(newTripsData);
        isReady.value = true;
    },
    { immediate: true }
);

</script>

<template>
    <Navbar/>
    <div class="bg-light flex flex-col items-center justify-center">
        <div class="w-11/12 md:w-10/12 xl:w-8/12 mx-auto my-8">
            <HeroBannerButton
                :title="t('trip.title')"
                :subtitle="t('trip.subtitle')"
                :button-text="t('trip.new_trip')"
                :icon="MapPin"
                button-link="/trip/create"
                :is-btn-disabled="false"
            />

            <!--Trip-->
            <div class="bg-white border border-gray-200 mt-8 rounded-sm px-4 py-4 shadow-xs">
                <div class="flex flex-row items-center gap-2">
                    <MapPin
                        size="24"
                        class="text-dark"
                    />
                    <div class="flex flex-row gap-2 items-center">
                        <h3 class="text-dark font-medium text-[1.2rem] md:text-[1.4rem]">
                            {{ $t("trip.my_trips") }}
                        </h3>
                        <div
                            class="relative inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 overflow-hidden bg-warm rounded-full">
                            <span class="font-medium text-white text-sm">
                                {{ trips ? trips.length : '0' }}
                            </span>
                        </div>
                    </div>
                </div>
                <div v-if="!isReady" class="flex flex-row justify-around gap-4 flex-wrap">
                    <div v-for="n in 3" class="mt-4">
                        <TripCardSkeleton />
                    </div>
                </div>
                <div v-else-if="trips && trips.length > 0" class="flex flex-row justify-around gap-4 flex-wrap">
                    <div v-for="trip in trips" :key="trip.id" class="mt-4">
                        <TripCard :trip="trip"/>
                    </div>
                </div>
                <div v-else class="flex flex-col items-center justify-center mt-4">
                    <MapPin
                        size="42"
                        class="text-warm"
                    />
                    <h3 class="text-xl text-warm">
                        {{ $t("trip.no_trip") }}
                    </h3>
                    <h4 class="text-lg text-warm">
                        {{ $t("trip.no_trip_text") }}
                    </h4>
                </div>
            </div>

        </div>
    </div>
    <Footer />
</template>

<style scoped>

</style>
