import { IEntity } from './IEntity';

export default class User implements IEntity
{
    id?: number;

    firstName: string;
    lastName: string;
    userName: string;
    apiKey: string;
    
    synchronized: boolean;
    lastSynchronized?: Date;


    constructor(id: number, userName: string, apiKey: string, firstName: string, lastName: string) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.userName = userName;
        this.id = id;
        this.apiKey = apiKey;
        this.synchronized = true;
        this.lastSynchronized = new Date();
    }
}