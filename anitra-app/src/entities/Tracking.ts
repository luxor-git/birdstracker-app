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

    /**
     * Whether the tracking is checked, used for UI synchronization.
     *
     * @type {boolean}
     * @memberof Tracking
     */
    public trackLoaded: boolean = false;

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

    public getLastPositionText() : string {
        return [
            this.lastPosition.settlement,
            this.lastPosition.admin2,
            this.lastPosition.admin1
        ].filter((x) => !!x).join(', ');
    }

    toJson(): object {
        return {
            id: this.id,
            name: this.name,
            code: this.code,
            note: this.note,
            age: this.age,
            sex: this.sex,
            deviceId: this.deviceId,
            deviceStatusName: this.deviceStatusName,
            firstPosition: this.firstPosition,
            lastPosition: this.lastPosition,
            species: this.species, // todo save only id - this is not needed
            lastSynchronized: this.lastSynchronized,
            deviceCode: this.deviceCode
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
        this.age = obj.age;
        this.sex = obj.sex;
        this.deviceCode = obj.deviceCode;

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

export class Position
{
    lat: number;
    lng: number;

    timestamp?: number;
}

export class Track implements ISerializableEntity
{
    toJson(): object {
        return {
            id: this.id,
            synchronized: this.synchronized,
            lastSynchronized: this.lastSynchronized,
            positions: this.positions
        };
    }
    
    toJsonString(): string {
        return JSON.stringify(this.toJson());
    }

    fromJson(json: any): IEntity {
        this.id = json.id;
        this.synchronized = false;
        this.lastSynchronized = json.lastSynchronized;
        this.positions = json.positions;
        return this;
    }

    getPolyLine() : any {
        return this.positions.map(x => {
            return {
                latitude: x.lat,
                longitude: x.lng
            }
        })
    }

    id?: number;
    synchronized: boolean;
    lastSynchronized?: Date;

    positions: Position[] = [];
}