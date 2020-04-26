import axios from 'axios';
import { BaseActionResult } from './ActionResult';

let invalidTokenListeners: Function[] = [];

export const ApiConstants = {
    API_URL: 'https://app.anitra.cz/api/v1/',
    API_AUTH_URL: 'login',
    API_TRACKED_OBJECT: 'tracked-object',
    API_LIST: 'list',
    API_SPECIES: 'species',
    API_GALLERY: 'gallery',
    API_TRACK: 'data',
    API_POINT: 'get-point',
    API_NOTIFICATION_URL: 'notification',
    API_USER: 'user'
};

/**
 * Formats post request for Axios.
 *
 * @export
 * @param {FormData} formData
 * @param {string} [apiKey]
 * @returns {*}
 */
export function formatPostRequest(formData: FormData, apiKey?: string) : any {
    let ret = {
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formData,
        timeout: 10000
    };

    if (apiKey) {
        ret.headers["Authorization"] = apiKey;
    }

    return ret;
};

/**
 * Formats GET request for Axios.
 *
 * @export
 * @param {string} [apiKey]
 * @returns {*}
 */
export function formatGetRequest(apiKey?: string) : any {
    let obj : any = {
        method: 'get',
        timeout: 10000,
        headers: {}
    };

    if (apiKey) {
        obj.headers["Authorization"] = apiKey;
    }

    return obj;
};

/**
 * Adds listener for invalid tokens.
 *
 * @export
 * @param {Function} callback
 */
export function addInvalidTokenListener(callback: Function) : void {
    invalidTokenListeners.push(callback);
}

/**
 * Calls an API request.
 *
 * @export
 * @param {string} url
 * @param {*} options
 * @returns {Promise<BaseActionResult>}
 */
export async function apiRequest(url: string, options: any) : Promise<BaseActionResult>
{
    console.log('---');
    console.log('Sending request', options);

    if (!options.url) {
        options.url = ApiConstants.API_URL + url;
    }

    const apiResponse = await axios(
        options
    );

    console.log(apiResponse.data["STATUS_CODE"]);
    console.log(apiResponse.data.MESSAGE);

    // todo - fix this in the API
    if (apiResponse.data["STATUS_CODE"] === "ERROR" && apiResponse.data.MESSAGE === "API key is invalid") {
        console.log('Invalid API key!');
        invalidTokenListeners.forEach( async x => await x() );
    }

    //console.log(apiResponse.data);

    let baseResponse = new BaseActionResult( apiResponse.data["STATUS_CODE"] === "OK" );
    baseResponse.data = apiResponse.data;

    if (apiResponse.data.MESSAGE) {
        baseResponse.messages.push(apiResponse.data.MESSAGE);
    }

    return baseResponse;
};

/**
 * Formats a date.
 *
 * @export
 * @param {*} date
 * @returns {Date}
 */
export function formatDate(date: any) : Date {
    return date;
}