<script setup lang="ts">
import {MapPinned, UsersRound, CalendarArrowDown, CalendarArrowUp, Eye} from "lucide-vue-next";
import {onMounted, ref} from "vue";
import TripInterface from "@/interfaces/tripInterface";
import {useI18n} from "vue-i18n";
import {useUserStore} from "@/stores/userStore";
import {storeToRefs} from "pinia";

const {t} = useI18n();

const props = defineProps<{
    trip: TripInterface
}>();
const {trip} = props;

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const tripParticipantsCount = ref(1);
const tripArrivalDate = ref(null);
const tripDepartureDate = ref(null);

function getTripParticipantsCount() {
    tripParticipantsCount.value = trip.participants && trip.participants.length > 0 ? trip.participants.length : '1';
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR').format(date);
}

function getTripDates(): void {
    const stopsCount = trip.stops.length;
    if (trip.stops[0]) {
        tripArrivalDate.value = formatDate(trip.stops[0].arrivalDate ?? trip.stops[0].arrival_date);
        tripDepartureDate.value = formatDate(trip.stops[stopsCount - 1].departureDate ?? trip.stops[stopsCount - 1].departure_date);
    }
}

function canEditTrip() {
    const authorId = trip.author.id;

    if (user.value && authorId === user.value.id) {
        return true;
    } else if (trip.participantsList && trip.participantsList.length > 0) {
        for (const participant of trip.participantsList) {
            if (participant.id === user.value?.id && participant.permission === 'update') {
                return true;
            }
        }
    } else {
        return false;
    }
}

onMounted(() => {
    getTripParticipantsCount();
    getTripDates();
})
</script>

<template>
    <div class="bg-gray-100/20 border border-gray-200 rounded-sm shadow-xs w-80 md:w-100">

        <div class="relative">
            <img
                src="../../../../assets/trip_card_cover.jpg" alt="Trip card cover"
                class="w-full h-50 object-cover"
            />
            <div class="absolute right-3 top-0 flex flex-row items-center gap-2 md:mt-4 border-1 border-warm bg-white/90 rounded-sm px-2 shadow-sm">
                <Eye
                    size="16"
                    class="text-warm"
                />
                <h4 class="text-[1rem] text-warm">
                    {{ trip.isPublic ? $t("trip.public") : $t("trip.private") }}
                </h4>
            </div>
        </div>

        <div class="flex flex-col items-start max-h-80 px-4 py-4 w-full">
            <h3 class="text-dark text-xl font-medium truncate">
                {{ trip.label }}
            </h3>
            <h4 class="text-sm mt-2 w-full truncate text-dark">
                {{ trip.description ? trip.description : $t("trip.trip_no_description") }}
            </h4>
            <div class="flex flex-col w-full">

                <div class="flex flex-row gap-2 md:gap-4 flex-wrap md:flex-between mt-2 w-full">
                    <div class="flex flex-row items-center gap-2 md:mt-4 border-1 border-warm bg-white/90 px-2 rounded-sm px-2 shadow-sm">
                        <MapPinned
                            size="16"
                            class="text-warm"
                        />
                        <h4 class="text-[1rem] text-warm">
                            {{ trip.stops ? trip.stops.length : '0' }} {{ $t("trip.stops") }}
                        </h4>
                    </div>
                    <div class="flex flex-row items-center gap-2 md:mt-4 border-1 border-warm bg-white/90 px-2 rounded-sm px-2 shadow-sm">
                        <UsersRound
                            size="16"
                            class="text-warm"
                        />
                        <h4 class="text-[1rem] text-warm">
                            {{ tripParticipantsCount }}
                            {{ tripParticipantsCount > 1 ? $t("trip.participants") : $t("trip.participants") }}
                        </h4>
                    </div>

                </div>

                <div class="flex flex-row justify-start gap-4 w-full">
                    <div v-if="tripArrivalDate" class="flex flex-row items-center gap-2 mt-2 md:mt-4 border-1 border-warm bg-white/90 px-2 rounded-sm px-2 shadow-sm">
                        <CalendarArrowDown
                            size="14"
                            class="text-warm"
                        />
                        <h4 class="text-[1rem] text-warm">
                            {{ tripArrivalDate }}
                        </h4>
                    </div>
                    <div v-if="tripDepartureDate" class="flex flex-row items-center gap-2 mt-2 md:mt-4 border-1 border-warm bg-white/90 px-2 rounded-sm px-2 shadow-sm">
                        <CalendarArrowUp
                            size="14"
                            class="text-warm"
                        />
                        <h4 class="text-[1rem] text-warm">
                            {{ tripDepartureDate }}
                        </h4>
                    </div>
                </div>

                <div class="flex flex-row items-center gap-2 mt-4 md:mt-6" v-if="trip.author && trip.author.pseudo">
                    <div class="relative inline-flex items-center justify-center w-8 h-8 overflow-hidden bg-cream rounded-full">
                        <span class="font-medium text-dark text-lg">{{ trip.author.pseudo.charAt(0).toUpperCase() }}</span>
                    </div>
                    <h4 class="text-[1.2rem] font-medium text-dark">
                        {{ trip.author.pseudo }}
                    </h4>
                </div>


                <div class="flex flex-row justify-center items-center gap-2 mt-4 md:mt-6 w-full" v-if="trip.author">
                    <a v-if="canEditTrip()" :href="`/trip/edit/${trip.id}`" class="w-full">
                        <button
                            class="w-full flex flex-row gap-2 justify-center items-center border py-2 bg-warm text-light font-medium rounded-sm px-4 cursor-pointer hover:bg-warmer"
                        >
                            {{ $t("trip.edit_trip.edit_btn") }}
                        </button>
                    </a>
                    <a v-else :href="`/trip/view/${trip.id}`" class="w-full">
                        <button
                            class="w-full flex flex-row gap-2 justify-center items-center border py-2 bg-warm text-light font-medium rounded-sm px-4 cursor-pointer hover:bg-warmer"
                        >
                            {{ $t("trip.view_btn") }}
                        </button>
                    </a>
                </div>

            </div>

        </div>
    </div>
</template>

<style scoped>

</style>
