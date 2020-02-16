export const ApiStrings = {
    API_RESPONSE_ERROR: 'Error getting data'
};

export function getString(key: string) : string
{
    if (!ApiStrings[key]) {
        return key + "(?)";
    }

    return ApiStrings[key];
}

