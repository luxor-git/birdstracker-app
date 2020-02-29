import { IEntity, ISerializableEntity } from './IEntity';

export default class Layer implements IEntity {
    id?: number;

    tileUrl: string;

    localTileUrl: string;

    name: string;

    imageName: string;

    shouldCache: boolean = true;

    synchronized: boolean = true;

    lastSynchronized?: Date;

    constructor(name: string, tileUrl: string, localTileUrl: string) {
        this.name = name;
        this.tileUrl = tileUrl;
        this.localTileUrl = localTileUrl;
    }

    public getTileUrl() : string {
        return this.tileUrl;
    }
};