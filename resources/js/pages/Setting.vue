<script setup lang="ts">
import {usePage} from "@inertiajs/vue3";
import {ref, watch} from "vue";
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import HeroBanner from "@/components/HeroBanner.vue";
import {useI18n} from "vue-i18n";
import Notification from "@/components/Notification.vue";
import {Eye, EyeOff, CircleUserRound, KeyRound} from "lucide-vue-next";
import {useNotification} from "@/composables/useNotification";
import {useUserStore} from "@/stores/userStore";
import {storeToRefs} from "pinia";
import {useUserApi} from "@/services/api/userApiService";
import {useAuthApi} from "@/services/api/authApiService";

const {t} = useI18n();
const page = usePage();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const showPassword = ref(false);
const showPasswordConfirmation = ref(false);

const formDataUserInfo = ref({
    pseudo: '',
    email: '',
    password: '',
    password_confirmation: '',
});

const orsApiKey = ref<string|null>(null);

const errors = ref({});
const {notification, showNotification} = useNotification();

const {
    updateUserInfos,
    validationErrors: authValidationErrors,
    loading: authLoading,
    error: authError
} = useAuthApi()

const {
    addOrsApiKey,
    validationErrors: userValidationErrors,
    loading: userLoading,
    error: userError
} = useUserApi()


async function handleUserUpdateSubmit(e: Event) {
    e.preventDefault();
    errors.value = {};

    try {
        await updateUserInfos({
            _token: page.props.csrf_token,
            ...formDataUserInfo.value
        })

        showNotification(t("setting.form.notification.user_infos_success"), 'success', 5000);
    } catch (error: any) {
        if (authValidationErrors.value) {
            errors.value = authValidationErrors.value
            showNotification(t("setting.form.notification.errors.form"), 'error', 5000);
        } else {
            showNotification(t("setting.form.notification.errors.server"), 'error', 5000);
        }
    }
}

async function handleAPIKeySubmit(e: Event) {
    e.preventDefault();
    errors.value = {};

    try {
        await addOrsApiKey({
            _token: page.props.csrf_token,
            ors_api_key: orsApiKey.value
        })
        showNotification(t("setting.form.notification.ors_api_key_success"), 'success', 5000);
    } catch (error: any) {
        if (userValidationErrors.value) {
            errors.value = userValidationErrors.value;
            showNotification(t("setting.form.notification.errors.form"), 'error', 5000);
        } else {
            showNotification(t("setting.form.notification.errors.server"), 'error', 5000);
        }
    }
}

watch(
    () => user.value,
    () => {
        if (user.value) {
            formDataUserInfo.value.pseudo = user.value.pseudo;
            formDataUserInfo.value.email = user.value.email;
        }
    },
    { immediate: true }
);

// TODO: Add rate limit infos
</script>

<template>
    <Navbar/>
    <div class="bg-light flex flex-col items-center justify-center">
        <div class="w-8/12 mx-auto my-8 min-h-[70vh]">
            <HeroBanner
                :title="t('setting.title')"
                :subtitle="t('setting.subtitle')"
            />

            <div class="bg-white border border-gray-200 mt-8 rounded-sm px-4 py-4 shadow-xs">
                <div class="flex flex-row items-center gap-2">
                    <CircleUserRound
                        size="24"
                        class="text-dark"
                    />
                    <h3 class="text-dark font-medium text-[1.2rem] md:text-[1.4rem]">
                        {{ $t("setting.my_infos") }}
                    </h3>
                </div>

                <form class="text-dark flex flex-col items-center" name="login" method="POST" @submit="handleUserUpdateSubmit">
                    <div class="flex flex-col mt-8">
                        <label for="pseudo" class="p-1 font-medium text-lg">{{ $t("setting.form.pseudo") }}</label>
                        <input
                            type="text"
                            v-model="formDataUserInfo.pseudo"
                            :placeholder="t('setting.form.pseudo')"
                            class="w-70 md:w-100 bg-white/70 border border-warm p-2 rounded-lg text-warm focus:outline-warm"
                            name="pseudo" required
                            id="pseudo"
                        >
                        <div v-if="errors.pseudo" class="text-red-500 text-sm mt-1">{{ errors.pseudo[0] }}</div>
                    </div>

                    <div class="flex flex-col mt-4">
                        <label for="email" class="p-1 font-medium text-lg">{{ $t("setting.form.email") }}</label>
                        <input
                            type="email"
                            v-model="formDataUserInfo.email"
                            :placeholder="t('setting.form.email')"
                            class="w-70 md:w-100 bg-white/70 border border-warm p-2 rounded-lg text-warm focus:outline-warm"
                            name="email" required
                            id="email"
                        >
                        <div v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email[0] }}</div>
                    </div>

                    <div class="flex flex-col mt-4">
                        <label for="password" class="p-1 font-medium text-lg">{{ $t("setting.form.password") }}</label>
                        <div class="relative">
                            <input
                                :type="showPassword ? 'text' : 'password'"
                                v-model="formDataUserInfo.password"
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
                                <Eye v-if="!showPassword" :size="20"/>
                                <EyeOff v-else :size="20"/>
                            </button>
                        </div>
                        <div v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password[0] }}</div>
                    </div>
                    <div class="flex flex-col mt-4">
                        <label for="password_confirmation" class="p-1 font-medium text-lg">{{ $t("form.auth.password_confirmation") }}</label>
                        <div class="relative">
                            <input
                                :type="showPasswordConfirmation ? 'text' : 'password'"
                                v-model="formDataUserInfo.password_confirmation"
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
                    <button
                        type="submit"
                        class="mt-4 mb-4 py-2 px-4 w-70 md:w-100 border border-warm bg-dark rounded-lg text-cream font-medium cursor-pointer"
                    >
                        {{ $t("setting.form.update") }}
                    </button>
                </form>
            </div>

            <div class="bg-white border border-gray-200 mt-8 rounded-sm px-4 py-4 shadow-xs">
                <div class="flex flex-row items-center gap-2">
                    <KeyRound
                        size="24"
                        class="text-dark"
                    />
                    <h3 class="text-dark font-medium text-[1.2rem] md:text-[1.4rem]">
                        {{ $t("setting.ors.title") }}
                    </h3>
                </div>
                <div class="mt-4 flex flex-col justify-center px-8">
                    <i18n-t keypath="setting.ors.text" tag="span" class="text-warm text-lg">
                        <template #link>
                            <a href="https://account.heigit.org/signup" target="_blank">
                                <span class="underline font-bold">{{ t('setting.ors.title') }}</span>
                            </a>
                        </template>
                    </i18n-t>

                    <form class="text-dark flex flex-col items-center" name="login" method="POST" @submit="handleAPIKeySubmit">
                        <div class="flex flex-col mt-8">
                            <label for="pseudo" class="p-1 font-medium text-lg">{{ $t("setting.form.api_key") }}</label>
                            <input
                                type="text"
                                v-model="orsApiKey"
                                placeholder="6b***4kp3***54"
                                class="w-70 md:w-100 bg-white/70 border border-warm p-2 rounded-lg text-warm focus:outline-warm"
                                name="pseudo" required
                                id="pseudo"
                            >
                            <div v-if="errors.ors_api_key" class="text-red-500 text-sm mt-1">{{ errors.ors_api_key[0] }}</div>
                        </div>
                        <button
                            type="submit"
                            class="mt-4 mb-4 py-2 px-4 w-70 md:w-100 border border-warm bg-dark rounded-lg text-cream font-medium cursor-pointer"
                        >
                            {{ $t("setting.form.update") }}
                        </button>
                    </form>
                </div>
            </div>
        </div>
        <Notification :notification="notification"/>
    </div>
    <Footer/>
</template>

<style scoped>

</style>
