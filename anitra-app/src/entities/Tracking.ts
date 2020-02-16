import { IEntity } from './IEntity';

export class Tracking implements IEntity
{
    id: number;
    name: string;
    code: string;
    note: string;

    deviceId: number;
    deviceStatusName?: string;

    firstPosition?: LocalizedPosition;
    lastPosition?: LocalizedPosition;

    species?: Species;

    synchronized: boolean = false;
    lastSynchronized?: Date;

    public getName():string {
        if (this.name && this.code) {
            return this.name + ' (' + this.code + ')';
        }

        return this.name??this.code;
    }

};

export class LocalizedPosition
{
    lat: number;
    lng: number;

    admin1: string;
    admin2: string;
    settlement: string;
    country: string;

    date?: Date;
};

export class Species implements IEntity
{
    id?: number;

    scientificName: string;
    englishName: string;
    
    synchronized: boolean;
    lastSynchronized?: Date;

    constructor(id: number, scientificName: string, englishName: string) {
        this.id = id;
        
        this.scientificName = scientificName;
        this.englishName = englishName;

        this.synchronized = true;
        this.lastSynchronized = new Date();
    }
};