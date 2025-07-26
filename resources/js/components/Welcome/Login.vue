<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from "vue-i18n";
import { Eye, EyeOff } from "lucide-vue-next";
import {usePage} from "@inertiajs/vue3";
import Notification from "@/components/Notification.vue";
import {useNotification} from "@/composables/useNotification";
import {useAuthApi} from "@/services/api/authApiService";

const {t} = useI18n();
const page = usePage()

const {
    login,
    error: loginError,
    validationErrors: loginValidationErrors
} = useAuthApi()

const emit = defineEmits(['toggle-visibility']);
const showPassword = ref(false);

const formData = ref({
    email: '',
    password: '',
    remember_me: false
});

const errors = ref({});
const { notification, showNotification } = useNotification();

async function handleSubmit(e: Event) {
    e.preventDefault();
    errors.value = {};

    try {
        await login({
            _token: page.props.csrf_token,
            ...formData.value
        });

        formData.value = {
            email: '',
            password: '',
            remember_me: false
        };

        window.location.href = '/discover';
    } catch (error: any) {
        if (loginValidationErrors.value) {
            errors.value = loginValidationErrors.value;
            showNotification(t("form.auth.notification.error.form"), 'error');
        } else if (error.response && error.response.status === 401) {// Credentials errors
            showNotification(t("form.auth.notification.error.credentials"), 'error');
        } else {// Other errors
            showNotification(t("form.auth.notification.error.server"), 'error');
        }
    }
}
</script>

<template>

    <div class="flex flex-col justify-center items-center h-screen gap-4">
        <h2 class="text-4xl font-bold text-dark">
            {{ $t("form.auth.login_title") }}
        </h2>
        <h3 class="text-xl md:text-2xl font-medium text-dark text-center">
            {{ $t("form.auth.login_subtitle") }}
        </h3>

        <form class="text-dark flex flex-col items-center" name="login" method="POST" @submit="handleSubmit">
            <div class="flex flex-col mt-8">
                <label for="email" class="p-1 font-medium text-lg">{{ $t("form.auth.email") }}</label>
                <input
                    type="email"
                    v-model="formData.email"
                    :placeholder="t('form.auth.email')"
                    class="w-70 md:w-100 bg-white/70 border border-warm p-2 rounded-lg text-warm focus:outline-warm"
                    name="email" required
                    id="email"
                >
                <div v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email[0] }}</div>
            </div>

            <div class="flex flex-col mt-4">
                <label for="password" class="p-1 font-medium text-lg">{{ $t("form.auth.password") }}</label>
                <div class="relative">
                    <input
                        :type="showPassword ? 'text' : 'password'"
                        v-model="formData.password"
                        placeholder="********"
                        class="w-70 md:w-100 bg-white/70 border border-warm p-2 rounded-lg text-warm focus:outline-warm"
                        name="password" required
                        id="password"
                    >
                    <button
                        type="button"
                        @click="showPassword = !showPassword"
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-warm cursor-pointer"
                    >
                        <Eye v-if="!showPassword" :size="20" />
                        <EyeOff v-else :size="20" />
                    </button>
                </div>
                <div v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password[0] }}</div>
            </div>

            <div class="flex flex-row gap-2 mt-4 self-start">
                <input
                    type="checkbox"
                    v-model="formData.remember_me"
                    :placeholder="t('form.auth.email')"
                    class="bg-white/70 border border-warm p-2 rounded-lg text-warm focus:outline-warm"
                    name="remember_me"
                    id="remember_me"
                >
                <label for="remember_me" class="p-1 font-medium text-[1rem]">{{ $t("form.auth.remember_me") }}</label>
            </div>

            <button
                type="submit"
                class="mt-4 mb-4 py-2 px-4 w-full border border-warm bg-dark rounded-lg text-cream font-medium cursor-pointer"
            >
                {{ $t("form.auth.sign_in") }}
            </button>
            <a
                @click="emit('toggle-visibility', false)"
                class="text-dark text-sm font-medium hover:underline cursor-pointer"
            >
                {{ $t("form.auth.no_account") }} {{ $t("form.auth.sign_up") }}
            </a>
        </form>
        <Notification :notification="notification"/>
    </div>
</template>

<style scoped>

</style>
