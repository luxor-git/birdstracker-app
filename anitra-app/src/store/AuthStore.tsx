import BaseStore from './BaseStore';
import NetStore from './NetStore';
import { ApiConstants, formatPostRequest } from "../common/ApiUtils";
import { BaseActionResult } from "../common/ActionResult";
import { getString, ApiStrings } from "../common/ApiStrings";
import { AsyncStorage } from 'react-native';
import { observable } from "mobx";

class AuthStore extends BaseStore
{
    @observable public isAuthorized: boolean = false;

    public async awaitAuth() : Promise<void>
    {
        const value = await AsyncStorage.getItem(STORAGE_KEY_INDEXES.AUTH_KEY);

        if (value) {
            if (NetStore.getOnline()) {
                this.isAuthorized = await this.verifyToken(value);
            } else {
                this.isAuthorized = true; // auth cannot be verified at this time
            }
        } else {
            this.isAuthorized = false;
        }

        return;
    }

    public async verifyToken(token: string) : Promise<boolean>
    {
        return false;
    }

    public getAuthToken() : string
    {
        return "";
    }

    public async authenticate(username: string, password: string) : Promise<BaseActionResult>
    {
        let result = new BaseActionResult(false);

        const data = {
            'email': username,
            'password': password
        };

        try {
            let jsonResponse = await (await fetch(ApiConstants.API_URL + ApiConstants.API_AUTH_URL, formatPostRequest(data)).then()).json();
        } catch {
            result.success = false;
            result.messages.push(getString('API_RESPONSE_ERROR'));
        }

        return result;
    }
}

const STORAGE_KEY_INDEXES = {
    AUTH_KEY: 'AUTH_KEY'
};


const store = new AuthStore();

export default store;