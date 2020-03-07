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
    API_TRACK: 'data'
};

export function formatPostRequest(formData: FormData, apiKey?: string) : any {
    return {
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formData,
        timeout: 10000
    };
};

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

export function addInvalidTokenListener(callback: Function) : void {
    invalidTokenListeners.push(callback);
}

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

export function formatDate(date: any) : Date 
{
    return date;
}