<script setup lang="ts">
import {UserRoundPlus, X} from "lucide-vue-next";
import {useI18n} from "vue-i18n";
import {ref} from "vue";
import {usePage} from "@inertiajs/vue3";
import Notification from "@/components/Notification.vue";
import {useNotification} from "@/composables/useNotification";
import {useUserApi} from "@/services/api/userApiService";

const page = usePage()
const {t} = useI18n();

const emit = defineEmits(['toggle-visibility']);

const formData = ref({
    pseudo: '',
});

const errors = ref({});
const { notification, showNotification } = useNotification();

async function handleSubmit(e: Event) {
    e.preventDefault();
    errors.value = {};

    try {
        const data = await useUserApi().getUserIdByPseudo(formData.value.pseudo, {
            _token: page.props.csrf_token,
        })

        await useUserApi().sendFriendRequest({
            _token: page.props.csrf_token,
            user_id: data.user_id
        })

        formData.value = {
            pseudo: '',
        };

        showNotification(t("friend.form.add_friend.notification.success"), 'success');
    } catch (error: any) {
        if (error.response && error.response.status === 422) {// Validation errors
            errors.value = error.response.data.errors;
            showNotification(t("friend.form.notification.error.form"), 'error');
        } else if (error.response && error.response.status === 401) {// TODO: error user not found
            showNotification(t("form.auth.notification.error.credentials"), 'error');
        } else {// Other errors
            showNotification(t("friend.form.add_friend.notification.error.server"), 'error');
        }
    }
}
</script>

<template>

    <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="z-99 absolute bg-black/20 backdrop-blur-[0.1rem] w-full h-full"></div>

        <div class="z-100 w-100 bg-white border border-gray-200 rounded-sm px-4 py-4 shadow-lg">

            <div class="flex flex-row justify-between">
                <div
                    class="flex flex-row gap-2 items-center text-dark font-medium">
                    <UserRoundPlus
                        size="24"
                    />
                    <h3 class="text-xl">{{ $t("friend.add_friend") }}</h3>
                </div>
                <div class="relative inline-flex items-center justify-center w-8 h-8 overflow-hidden cursor-pointer rounded-lg">
                    <X
                        @click="emit('toggle-visibility')"
                        class="text-dark"
                        size="20"
                    />
                </div>
            </div>

            <div>
                <form class="text-dark flex flex-col items-center" name="login" method="POST" @submit="handleSubmit">
                    <div class="flex flex-col mt-2 w-full">
                        <label for="pseudo" class="p-1 font-medium text-lg">{{ $t("friend.form.add_friend.pseudo") }}</label>
                        <input
                            type="text"
                            v-model="formData.pseudo"
                            :placeholder="t('friend.form.add_friend.pseudo')"
                            class="bg-white/70 border border-warm p-2 rounded-lg text-warm focus:outline-warm"
                            name="pseudo" required
                            id="pseudo"
                        >
                        <div v-if="errors.pseudo" class="text-red-500 text-sm mt-1">{{ errors.pseudo[0] }}</div>
                        <div v-if="errors.user_id" class="text-red-500 text-sm mt-1">{{ errors.user_id[0] }}</div>
                    </div>
                    <div class="flex flex-row gap-2 justify-between w-full">
                        <button
                            type="submit"
                            class="mt-4 py-2 px-4 w-full border border-warm bg-warm text-light font-medium rounded-lg px-4 cursor-pointer hover:bg-warmer"
                        >
                            {{ $t("friend.form.add_friend.send") }}
                        </button>
                        <button
                            @click="emit('toggle-visibility')"
                            class="mt-4 py-2 px-4 w-full border border-warm border-2 rounded-lg text-warm font-medium cursor-pointer"
                        >
                            {{ $t("friend.form.add_friend.cancel") }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <Notification :notification="notification"/>
</template>

<style scoped>

</style>
