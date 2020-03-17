import { IEntity, ISerializableEntity } from './IEntity';
import { LatLng } from 'react-native-maps';
import { BoundingTileDefinition } from '../common/GeoUtils';

export class OfflineRegion implements IEntity, ISerializableEntity
{
    id?: number;

    synchronized: boolean = true;

    lastSynchronized?: Date;

    boundingBox: LatLng[];

    zoomLevels: [];

    tileWrap: BoundingTileDefinition;

    toJson(): object {
        return {
            id: this.id,
            synchronized: true,
            lastSynchronized: null,
            boundingBox: this.boundingBox,
            zoomLevels: this.zoomLevels,
            tileWrap: this.tileWrap
        }
    }

    toJsonString(): string {
        return JSON.stringify(this.toJson());
    }

    fromJson(json: any): IEntity {
        this.id = json.id;
        this.synchronized = json.synchronized;
        this.lastSynchronized = json.lastSynchronized;
        this.boundingBox = json.boundingBox.map(x => { return { latitude: parseFloat(x.latitude), longitude: parseFloat(x.longitude) } as LatLng; } );
        this.zoomLevels = json.zoomLevels;
        this.tileWrap = json.tileWrap;
        return this;        
    }
}