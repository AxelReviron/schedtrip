export type WithToken<T extends Record<string, any>> = T & {
    _token: string
}

export type JsonResponse = {
    message: string
}

//region UserApiService
export type UserId = {
    user_id: string
}

export type OrsData = {
    ors_api_key: string
}
//endregion

//region AuthApiService
export type UserInfos = {
    pseudo: ?string,
    email: ?string,
    password: ?string,
    password_confirmation: ?string,
}
//endregion

//region TripApiService
export type TripInfos = {
    label: string,
    description: string,
    is_public: boolean,
    distance: null,/*TODO: Bug here with API Platform*/
    duration: null,/*TODO: Bug here with API Platform*/
    geojson: string,
    author: string,// /api/users/xxx
}

export type StopInfos = {
    label: string,
    description: string,
    latitude: number,
    longitude: number,
    arrivalDate: string,
    departureDate: string,
    orderIndex: number,
    trip: string,// /api/trips/xxx
}

export type TripParticipant = {
    permission: string;
    user_id: string;
    user_pseudo: string;
}

export type TripParticipantsData = {
    participants: TripParticipant[]
}
//endregion
