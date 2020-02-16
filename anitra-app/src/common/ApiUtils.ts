import axios from 'axios';
import { BaseActionResult } from './ActionResult';

export const ApiConstants = {
    API_URL: 'https://app.anitra.cz/api/v1/',
    API_AUTH_URL: 'login',
    API_TRACKED_OBJECT: 'tracked-object',
    API_LIST: 'list'
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

    //todo pre-process hooks, for invalid tokens

    let baseResponse = new BaseActionResult( apiResponse.data.statusCode === "OK" );
    baseResponse.data = apiResponse.data;

    if (apiResponse.data.message) {
        baseResponse.messages.push(apiResponse.data.message);
    }


    return baseResponse;
};

export function formatDate(date: any) : Date 
{
    if (typeof date === "object") {
        if (date.date) {
            return new Date(date.data);
        }
    }

    return null;
}