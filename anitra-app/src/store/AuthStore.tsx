import BaseStore from './BaseStore';
import NetStore from './NetStore';
import { ApiConstants, formatPostRequest, apiRequest } from "../common/ApiUtils";
import { BaseActionResult } from "../common/ActionResult";
import { getString, ApiStrings } from "../common/ApiStrings";
import { AsyncStorage } from 'react-native';
import { observable } from "mobx";
import * as SecureStore from 'expo-secure-store';
import User from '../entities/User';

class AuthStore extends BaseStore
{
    @observable public isAuthorized: boolean = false;

    private user : User;

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

        if (this.isAuthorized) {
            this.user = await this.getUser();
        } else {
            await this.logout();
            // clear user data?
        }

        console.log(this.user);

        return;
    }

    private async verifyToken(token: string) : Promise<boolean>
    {
        return false;
    }

    public async getAuthToken() : Promise<string>
    {
        await this.awaitAuth();
        return this.user.apiKey;
    }

    public async getUser() : Promise<User>
    {
        if (!this.user) {
            const authKey = await AsyncStorage.getItem(STORAGE_KEY_INDEXES.AUTH_KEY);
            const userName = await AsyncStorage.getItem(STORAGE_KEY_INDEXES.USER_NAME);
            const firstName = await AsyncStorage.getItem(STORAGE_KEY_INDEXES.FIRST_NAME);
            const lastName = await AsyncStorage.getItem(STORAGE_KEY_INDEXES.LAST_NAME);
            const id = parseInt(await AsyncStorage.getItem(STORAGE_KEY_INDEXES.USER_ID));

            this.user = new User(
                id,
                userName,
                authKey,
                firstName,
                lastName
            );
        }

        return this.user;
    }

    public async authenticate(username: string, password: string) : Promise<BaseActionResult>
    {
        let result = new BaseActionResult(false);

        const data = new FormData();
        data.append('email', username);
        data.append('password', password);
        let response;

        try {
            response = await apiRequest(ApiConstants.API_AUTH_URL, formatPostRequest(data));
        } catch (e) {
            result.success = false;
            result.messages.push(getString('API_RESPONSE_ERROR'));
            return result;
        }

        if (response.success) {
            const apiKey = response.data.apiKey;
            const userData = response.data.detail;

            console.log('Api key', apiKey);
            await AsyncStorage.setItem(STORAGE_KEY_INDEXES.AUTH_KEY, apiKey);
            await AsyncStorage.setItem(STORAGE_KEY_INDEXES.USER_NAME, userData.Email);
            await AsyncStorage.setItem(STORAGE_KEY_INDEXES.FIRST_NAME, userData.FirstName);
            await AsyncStorage.setItem(STORAGE_KEY_INDEXES.LAST_NAME, userData.LastName);
            await AsyncStorage.setItem(STORAGE_KEY_INDEXES.USER_ID, response.data.id.toString());

            await SecureStore.setItemAsync(STORAGE_KEY_INDEXES.USER_NAME, username);
            await SecureStore.setItemAsync(STORAGE_KEY_INDEXES.PASSWORD, password);

            await this.getUser();
        }

        return response;
    }

    public async getStoredCredentials() : Promise<any>
    {
        try {
            let userName = await SecureStore.getItemAsync(STORAGE_KEY_INDEXES.USER_NAME);
            let password = await SecureStore.getItemAsync(STORAGE_KEY_INDEXES.PASSWORD);

            return {
                userName: userName,
                password: password
            };
        } catch {
            return {};
        }
    }

    public async logout() : Promise<void>
    {
        await AsyncStorage.clear();
        this.user = null;
    }

}

const STORAGE_KEY_INDEXES = {
    AUTH_KEY: 'AUTH_KEY',
    USER_NAME: 'USER_NAME',
    FIRST_NAME: 'FIRST_NAME',
    LAST_NAME: 'LAST_NAME',
    USER_ID: 'USER_ID',
    PASSWORD: 'PASSWORD'
};


const store = new AuthStore();

export default store;