<script setup lang="ts">
import {TreePalm, CircleUserRound, Globe, MapPin, UsersRound, Settings, LogOut, Languages} from "lucide-vue-next";
import {Head, usePage} from "@inertiajs/vue3";
import {computed, onMounted, ref} from "vue";
import axios from "axios";
import {useUserStore} from "@/stores/userStore";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import {useUserApi} from "@/services/api/userApiService";
import {useAuthApi} from "@/services/api/authApiService";

const {t} = useI18n();
const page = usePage();
const currentRoute = computed(() => page.props.ziggy.location);
const currentPage = currentRoute.value.split('/').pop() || 'home';

const isUserMenuOpen = ref(false);
const isLocaleMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { locale } = useI18n();

const locales = [
    { code: 'fr', label: 'Français', flag: 'fi-fr' },
    { code: 'en', label: 'English', flag: 'fi-us' },
];

async function changeLocale(code: string) {
    await axios.post('/locale/change', { locale: code });
    isLocaleMenuOpen.value = false;
    locale.value = code;
    Inertia.reload({ preserveState: false });
}

function toggleUserMenu(): void {
    isUserMenuOpen.value = !isUserMenuOpen.value;
    isLocaleMenuOpen.value = false;
}

function toggleLocalMenu(): void {
    isLocaleMenuOpen.value = !isLocaleMenuOpen.value;
    isUserMenuOpen.value = false;
}

function toggleMobileMenu(): void {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

async function logout(): void {
    await useAuthApi().logout({
        _token: page.props.csrf_token,
    })

    window.location.href = '/';
}

onMounted(async () => {
    const userId = page.props.auth.user.id;
    if (!user.value || !user.value.pseudo) {
        const user = await useUserApi().fetchUser(userId)
        await userStore.setUser(user);
    }
});

</script>

<template>
    <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Agbalumo&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/css/flag-icons.min.css" />
    </Head>

    <nav class="bg-white border-gray-200 ">
        <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
                <TreePalm
                    :size="32"
                    stroke-width="2"
                    class="text-warm drop-shadow-xs"
                />
                <span class="self-center text-2xl font-medium font-[Agbalumo] text-warm text-shadow-xs">SchedTrip</span>
            </a>
            <div class="flex items-center space-x-3 rtl:space-x-reverse md:order-2">
                <!-- Dropdown Local menu -->
                <div class="relative flex items-center">
                    <button @click="toggleLocalMenu" type="button" class="flex text-sm rounded-full md:me-0 cursor-pointer" id="user-menu-button" aria-expanded="false" data-dropdown-toggle="user-dropdown" data-dropdown-placement="bottom">
                        <span class="sr-only">Open user menu</span>
                        <Languages
                            stroke-width="1.5"
                            size="20"
                        />
                    </button>
                    <div :class="{'hidden': !isLocaleMenuOpen}" class="absolute top-5 right-0 z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-sm" id="user-dropdown">
                        <ul class="py-2" aria-labelledby="locale-menu-button">
                            <li v-for="loc in locales" :key="loc.code">
                                <button
                                    @click="changeLocale(loc.code)"
                                    type="button"
                                    :class="[
                                      'flex flex-row gap-2 items-center w-full px-4 py-2 text-sm text-gray-700 cursor-pointer',
                                      locale === loc.code ? 'bg-cream font-semibold' : 'hover:bg-gray-100'
                                    ]"
                                >
                                    <span :class="['fi', loc.flag]"></span>
                                    {{ loc.label }}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <!-- Dropdown User menu -->
                <div class="relative flex items-center">
                    <button @click="toggleUserMenu" type="button" class="flex text-sm rounded-full md:me-0 cursor-pointer" id="user-menu-button" aria-expanded="false" data-dropdown-toggle="user-dropdown" data-dropdown-placement="bottom">
                        <span class="sr-only">Open user menu</span>
                        <CircleUserRound
                            stroke-width="1.5"
                            size="20"
                        />
                    </button>
                    <div :class="{'hidden': !isUserMenuOpen}" class="absolute top-5 right-0 z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-sm min-w-45" id="user-dropdown">
                        <div class="px-4 py-3">
                        <span v-if="user?.pseudo" class="block text-sm text-gray-900">
                            {{ user.pseudo }}
                        </span>
                            <span v-if="user?.email" class="block text-sm  text-gray-500 truncate">
                            {{ user.email }}
                        </span>
                        </div>
                        <ul class="py-2" aria-labelledby="user-menu-button">
                            <li>
                                <a href="/setting" class="flex flex-row gap-2 items-center block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <Settings
                                        stroke-width="1.5"
                                        size="18"
                                    />
                                    {{ $t("navbar.settings") }}
                                </a>
                            </li>
                            <li>
                                <a @click="logout" href="#" class="flex flex-row gap-2 items-center block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <LogOut
                                        stroke-width="1.5"
                                        size="18"
                                    />
                                    {{ $t("navbar.sign_out") }}
                                </a>
                            </li>
                        </ul>
                    </div>
                    <button @click="toggleMobileMenu" data-collapse-toggle="navbar-user" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer" aria-controls="navbar-user" aria-expanded="false">
                        <span class="sr-only">Open main menu</span>
                        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div :class="{'hidden': !isMobileMenuOpen}" class="items-center justify-between w-full md:flex md:w-auto md:order-1" id="navbar-user">
                <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white">
                    <li>
                        <a
                            href="/discover"
                            :class="{
                                'bg-warm md:text-dark': currentPage === 'dashboard',
                                'md:hover:text-warm': currentPage !== 'dashboard'
                            }"
                            class="flex flex-row gap-2 items-center block py-2 px-3 text-gray-900 rounded-sm md:bg-transparent md:p-0"
                        >
                            <Globe
                                stroke-width="1.5"
                                size="18"
                            />
                            {{ $t("navbar.discover") }}
                        </a>
                    </li>
                    <li>
                        <a
                            href="/trip"
                            :class="{
                                'bg-warm md:text-dark': currentPage === 'trip',
                                'md:hover:text-warm': currentPage !== 'trip'
                            }"
                            class="flex flex-row gap-2 items-center block py-2 px-3 text-gray-900 rounded-sm md:bg-transparent md:p-0"
                        >
                            <MapPin
                                stroke-width="1.5"
                                size="18"
                            />
                            {{ $t("navbar.trips") }}
                        </a>
                    </li>
                    <li>
                        <a
                            href="/friend"
                            :class="{
                                'bg-warm md:text-dark': currentPage === 'friend',
                                'md:hover:text-warm': currentPage !== 'friend'
                            }"
                            class="flex flex-row gap-2 items-center block py-2 px-3 text-gray-900 rounded-sm md:bg-transparent md:p-0"
                        >
                            <UsersRound
                                stroke-width="1.5"
                                size="18"
                            />
                            {{ $t("navbar.friends") }}
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

</template>

<style scoped>

</style>
