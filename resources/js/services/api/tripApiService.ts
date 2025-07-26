import {useApi} from "@/composables/useApi";
import {JsonResponse, StopInfos, TripInfos, TripParticipantsData, WithToken} from "@/types/api";
import TripInterface from "@/interfaces/tripInterface";
import StopInterface from "@/interfaces/stopInterface";


export function useTripApi() {
    const {
        get,
        post,
        put,
        patch,
        del,
        loading,
        error,
        validationErrors
    } = useApi()

    //region POST
    function createTrip(data: WithToken<TripInfos>): Promise<TripInterface> {
        return post<TripInterface>("/api/trips", data, {
            'Content-Type': 'application/ld+json'
        })
    }

    function createStop(data: WithToken<StopInfos>): Promise<StopInterface> {
        return post<StopInterface>("/api/stops", data, {
            'Content-Type': 'application/ld+json'
        })
    }

    function addParticipantsToTrip(tripId: string, data: WithToken<TripParticipantsData>): Promise<JsonResponse> {
        return post<JsonResponse>(`/api/trips/${tripId}/participants`, data)
    }
    //endregion

    //region PATCH
    function updateTrip(tripId: string, data: WithToken<TripInfos>): Promise<TripInterface> {
        return patch<TripInterface>(`/api/trips/${tripId}`, data, {
            'Content-Type': 'application/merge-patch+json'
        })
    }

    function updateStop(stopId: string, data: WithToken<StopInfos>): Promise<StopInterface> {
        return patch<StopInterface>(`/api/stops/${stopId}`, data, {
            'Content-Type': 'application/merge-patch+json'
        })
    }

    function updateParticipantsToTrip(tripId: string, data: WithToken<TripParticipantsData>): Promise<JsonResponse> {
        return patch<JsonResponse>(`/api/trips/${tripId}/participants`, data)
    }
    //endregion

    //region GET
    function getTripsByParticipant(userId: string): Promise<TripInterface[]> {
        return get<TripInterface[]>(`/api/trips/participant/${userId}`)
    }

    function getStop(stopId: string): Promise<StopInterface> {
        return get<StopInterface>(`/api/stops/${stopId}`)
    }
    //endregion

    return {
        loading,
        error,
        validationErrors,
        createTrip,
        createStop,
        addParticipantsToTrip,
        getTripsByParticipant,
        updateTrip,
        updateStop,
        updateParticipantsToTrip,
        getStop,
    }
}
