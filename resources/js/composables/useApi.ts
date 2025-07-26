import {ref} from "vue";
import axios, {AxiosRequestHeaders, AxiosResponse} from "axios";

export function useApi() {
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const validationErrors = ref<Record<string, string[]> | null>(null)
    const unauthorizedError= ref<Record<string, string[]> | null>(null)
    const rateLimitError= ref<Record<string, string[]> | null>(null)

    async function request<T = any>(
        method: "get" | "post" | "put" | "patch" | "delete",
        url: string,
        data?: any,
        headers?: AxiosRequestHeaders
    ): Promise<T> {
        loading.value = true
        error.value = null
        const config = { headers }

        try {
            let response: AxiosResponse<T>

            if (method === "get" || method === "delete") {
                response = await axios[method](url, config)
            } else {
                response = await axios[method](url, data, config)
            }
            return response.data
        } catch (err: any) {
            if (err.response?.status === 401) {
                unauthorizedError.value = err.response.data.errors
                error.value = "Unauthorized error"
            } else if (err.response?.status === 422) {
                rateLimitError.value = err.response.data.errors
                error.value = "Rate Limit error"
            } else if (err.response?.status === 429) {
                validationErrors.value = err.response.data.errors
                error.value = "Validation error"
            } else {
                validationErrors.value = null
                error.value = err.response?.data?.message || err.message
            }
            throw err
        } finally {
            loading.value = false
        }
    }

    function get<T = any>(url: string, headers?: AxiosRequestHeaders) {
        return request<T>('get', url, null, headers)
    }

    function post<T = any>(url: string, data: any, headers?: AxiosRequestHeaders) {
        return request<T>('post', url, data, headers)
    }

    function put<T = any>(url: string, data: any, headers?: AxiosRequestHeaders) {
        return request<T>('put', url, data, headers)
    }

    function patch<T = any>(url: string, data: any, headers?: AxiosRequestHeaders) {
        return request<T>('patch', url, data, headers)
    }

    function del<T = any>(url: string, headers?: AxiosRequestHeaders) {
        return request<T>('delete', url, null, headers)
    }

    return {
        loading,
        error,
        validationErrors,
        unauthorizedError,
        rateLimitError,
        get,
        post,
        put,
        patch,
        del
    }
}
