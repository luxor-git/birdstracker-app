import { IEntity, ISerializableEntity } from './IEntity';

export class Tracking implements ISerializableEntity
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
    lastSynchronized?: Date = new Date();

    public getName():string {
        if (this.name && this.code) {
            return this.name + ' (' + this.code + ')';
        }

        return this.name??this.code;
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
        let trk = new Tracking();
        let obj = json;

        trk.id = obj.id;
        trk.name = obj.name;
        trk.code = obj.code;
        trk.deviceId = obj.deviceId;
        trk.deviceStatusName = obj.deviceStatusName;
        trk.firstPosition = obj.firstPosition;
        trk.lastPosition = obj.lastPosition;
        trk.species = obj.species;
        trk.lastSynchronized = obj.lastSynchronized;

        return trk;
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
    lastSynchronized?: Date = new Date();
};