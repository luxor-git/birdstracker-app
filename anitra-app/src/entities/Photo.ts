import { IEntity, ISerializableEntity } from './IEntity';

import Constants from '../constants/Constants';

export default class Photo implements IEntity, ISerializableEntity {

    id?: number;
    
    synchronized: boolean;

    lastSynchronized?: Date;

    fileCreateDate: Date;

    thumbPath: string;

    fullPath: string;

    uploaderName: string;

    public getUrl() : string 
    {
        return Constants.IMAGE_BASE_URL + this.fullPath;
    }

    public getThumbUrl() : string 
    {
        return Constants.THUMB_BASE_URL + this.thumbPath;
    }

    toJson(): object {
        throw new Error("Method not implemented.");
    }
    toJsonString(): string {
        throw new Error("Method not implemented.");
    }
    fromJson(json: any): IEntity {
        throw new Error("Method not implemented.");
    }

};