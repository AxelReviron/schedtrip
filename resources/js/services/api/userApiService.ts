import UserInterface from "@/interfaces/userInterface";
import {JsonResponse, OrsData, UserId, WithToken} from "@/types/api";
import {useApi} from "@/composables/useApi";

export function useUserApi() {
    const {
        get,
        post,
        put,
        del,
        loading,
        error,
        validationErrors
    } = useApi()

    function fetchUser(id: number): Promise<UserInterface> {
        return get<UserInterface>(`/api/users/${id}`)
    }

    function getUserIdByPseudo(pseudo: string): Promise<UserId> {
        return get<UserId>(`/api/users/pseudo/${pseudo}`)
    }

    function sendFriendRequest(data: WithToken<UserId>): Promise<JsonResponse> {
        return post<JsonResponse>("/api/users/friends/send", data)
    }

    function addOrsApiKey(data: WithToken<OrsData>): Promise<JsonResponse> {
        return post<JsonResponse>("/api/users/ors/add-api-key", data)
    }

    return {
        loading,
        error,
        validationErrors,
        fetchUser,
        getUserIdByPseudo,
        sendFriendRequest,
        addOrsApiKey,
    }
}
