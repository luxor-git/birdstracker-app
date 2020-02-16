export const ApiConstants = {
    API_URL: 'https://app.anitra.cz/api/v1/',
    API_AUTH_URL: 'login'
};

export function formatPostRequest(jsonData) {
    return {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formatJsonForPost(jsonData)
    };
};

export function formatJsonForPost(data) {
    return Object.keys(data).map(function (keyName) {
        return encodeURIComponent(keyName) + '=' + encodeURIComponent(data[keyName])
    }).join('&');
};