import {useApi} from "@/composables/useApi";
import UserInterface from "@/interfaces/userInterface";
import {JsonResponse, UserInfos, WithToken} from "@/types/api";


export function useAuthApi() {
    const {
        get,
        post,
        put,
        patch,
        del,
        loading,
        error,
        validationErrors,
        rateLimitError,
    } = useApi()

    function login(data: WithToken<UserInfos>): Promise<void> {
        return post<UserInterface>("/auth/login", data)
    }

    function register(data: WithToken<UserInfos>): Promise<void> {
        return post<UserInterface>("/auth/register", data)
    }

    function logout(data: WithToken): Promise<void> {
        return post<UserInterface>("/auth/logout", data)
    }

    function updateUserInfos(data: WithToken<UserInfos>): Promise<JsonResponse> {
        return patch<JsonResponse>("/auth/update", data)
    }

    return {
        loading,
        error,
        validationErrors,
        rateLimitError,
        login,
        register,
        logout,
        updateUserInfos,
    }
}
