<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from "vue-i18n";
import { Eye, EyeOff } from "lucide-vue-next";
import Notification from "@/components/Notification.vue";
import {usePage} from "@inertiajs/vue3";
import {useNotification} from "@/composables/useNotification";
import {useAuthApi} from "@/services/api/authApiService";

const {t} = useI18n();
const page = usePage()
const showPassword = ref(false);
const showPasswordConfirmation = ref(false);
const emit = defineEmits(['toggle-visibility']);

const {
    register,
    error: registerError,
    validationErrors: registerValidationErrors,
    rateLimitError: registerRateLimitError
} = useAuthApi()

const formData = ref({
    pseudo: '',
    email: '',
    password: '',
    password_confirmation: '',
    consent: false
});

const errors = ref({});
const { notification, showNotification } = useNotification();


async function handleSubmit(e: Event) {
    e.preventDefault();
    errors.value = {};

    try {
        await register({
            _token: page.props.csrf_token,
            ...formData.value
        });

        formData.value = {
            pseudo: '',
            email: '',
            password: '',
            password_confirmation: '',
            consent: false
        };

        showNotification(t("form.auth.notification.register_success"), 'success', 4000);
        setTimeout(() => {
            window.location.href = '/discover';
        }, 4000);
    } catch (error: any) {
        if (registerValidationErrors.value) {// Validation errors
            console.log(registerValidationErrors.value)
            errors.value = registerValidationErrors.value;
            showNotification(t("form.auth.notification.error.form"), 'error');
        } else if (registerRateLimitError.value) {
            errors.value = registerRateLimitError.value
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
            {{ $t("form.auth.register_title") }}
        </h2>
        <h3 class="text-xl md:text-2xl font-medium text-dark text-center">
            {{ $t("form.auth.register_subtitle") }}
        </h3>

        <form class="text-dark flex flex-col items-center" name="register" method="POST" @submit="handleSubmit">
            <div class="flex flex-col mt-8">
                <label for="pseudo" class="p-1 font-medium text-lg">{{ $t("form.auth.pseudo") }}</label>
                <input
                    type="text"
                    v-model="formData.pseudo"
                    :placeholder="t('form.auth.pseudo')"
                    class="w-70 md:w-100 bg-white/70 border border-warm p-2 rounded-lg text-warm focus:outline-warm"
                    name="pseudo" required
                    id="pseudo"
                >
                <div v-if="errors.pseudo" class="text-red-500 text-sm mt-1">{{ errors.pseudo[0] }}</div>
            </div>

            <div class="flex flex-col mt-4">
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

            <div class="flex flex-col mt-4">
                <label for="password_confirmation" class="p-1 font-medium text-lg">{{ $t("form.auth.password_confirmation") }}</label>
                <div class="relative">
                    <input
                        :type="showPasswordConfirmation ? 'text' : 'password'"
                        v-model="formData.password_confirmation"
                        placeholder="********"
                        class="w-70 md:w-100 bg-white/70 border border-warm p-2 rounded-lg text-warm focus:outline-warm"
                        name="password_confirmation" required
                        id="password_confirmation"
                    >
                    <button
                        type="button"
                        @click="showPasswordConfirmation = !showPasswordConfirmation"
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-warm cursor-pointer"
                    >
                        <Eye v-if="!showPasswordConfirmation" :size="20" />
                        <EyeOff v-else :size="20" />
                    </button>
                </div>
            </div>

            <div class="flex flex-row gap-2 mt-4 self-start w-70 md:w-100">
                <input
                    type="checkbox"
                    v-model="formData.consent"
                    :placeholder="t('form.auth.email')"
                    class="bg-white/70 border border-warm p-2 rounded-lg text-warm focus:outline-warm"
                    name="consent" required
                    id="consent"
                >
                <label for="consent" class="p-1 font-medium text-xs md:text-[1rem]">
                    <i18n-t keypath="form.auth.register_consent" tag="span">
                        <template #terms_of_service>
                            <a href="/terms-of-service" target="_blank">
                                <span class="underline font-bold">{{ t('terms_of_service.title') }}</span>
                            </a>
                        </template>
                        <template #privacy_policy>
                            <a href="/privacy-policy" target="_blank">
                                <span class="underline font-bold">{{ t('privacy_policy.title') }}</span>
                            </a>
                        </template>
                    </i18n-t>
                    <div v-if="errors.consent" class="text-red-500 text-sm mt-1">{{ errors.consent[0] }}</div>
                </label>
            </div>

            <button
                type="submit"
                class="mt-4 mb-4 py-2 px-4 w-full border border-warm bg-dark rounded-lg text-cream font-medium cursor-pointer"
            >
                {{ $t("form.auth.sign_up") }}
            </button>
            <a
                @click="emit('toggle-visibility', true)"
                class="text-dark text-sm font-medium hover:underline cursor-pointer"
            >
                {{ $t("form.auth.have_account") }} {{ $t("form.auth.sign_in") }}
            </a>
        </form>
        <Notification :notification="notification"/>
    </div>
</template>

<style scoped>

</style>
