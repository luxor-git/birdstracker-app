import { IEntity, ISerializableEntity } from './IEntity';

export class Tracking implements ISerializableEntity
{
    id: number;
    name: string;
    code: string;
    note: string;

    deviceId: number;
    deviceStatusName?: string;
    deviceCode: string = "";

    sex: string = "";
    age: string = "";

    firstPosition?: LocalizedPosition;
    lastPosition?: LocalizedPosition;

    species?: Species;

    synchronized: boolean = false;
    lastSynchronized?: Date = new Date();

    public getName():string {
        if (this.name && this.code) {
            return this.name + ' (' + this.code + ')';
        }

        if (this.name) {
            return this.name;
        }

        if (this.code) {
            return this.code;
        }

        if (this.deviceCode) {
            return this.deviceCode;
        }

        return 'Error';
    }

    public getIconName() : string {
        if (this.lastPosition) {
            if (this.lastPosition.date) {
                let date = +new Date(this.lastPosition.date);
                let now = +new Date();
                let diff = now - date;
                if (diff < 86400 * 1000) {
                    return "marker24h";
                } else if (diff < 7 * 86400 * 1000) {
                    return "marker7d";
                } else if (diff < 30 * 86400 * 1000) {
                    return "marker30d";
                }
            }
        }

        return "markerElse";
    }

    toJson(): object {
        return {
            id: this.id,
            name: this.name,
            code: this.code,
            note: this.note,
            deviceId: this.deviceId,
            deviceStatusName: this.deviceStatusName,
            firstPosition: this.firstPosition,
            lastPosition: this.lastPosition,
            species: this.species, // todo save only id - this is not needed
            lastSynchronized: this.lastSynchronized
        };
    }

    toJsonString(): string {
        return JSON.stringify(this.toJson());
    }

    fromJson(json: any): IEntity {
        let obj = json;

        this.id = obj.id;
        this.name = obj.name;
        this.code = obj.code;
        this.deviceId = obj.deviceId;
        this.deviceStatusName = obj.deviceStatusName;
        this.firstPosition = obj.firstPosition;
        this.lastPosition = obj.lastPosition;
        this.species = obj.species;
        this.lastSynchronized = obj.lastSynchronized;

        return this;
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

export class Species implements IEntity, ISerializableEntity
{
    id?: number;

    scientificName: string;
    englishName: string;
    
    synchronized: boolean;
    lastSynchronized?: Date = new Date();

    toJson(): object {
        return {
            id: this.id,
            scientificName: this.scientificName,
            englishName: this.englishName
        }
    }

    fromJson(json: any): IEntity {
        this.id = json.id;
        this.scientificName = json.scientificName;
        this.englishName = json.englishName;
        return this;
    }

    toJsonString(): string {
        return JSON.stringify(this.toJson());
    }

};