import BaseStore from './BaseStore';
import AuthStore from './AuthStore';
import { ApiConstants, formatGetRequest, apiRequest, formatDate } from "../common/ApiUtils";
import { ListActionResult, EntityActionResult } from "../common/ActionResult";
import { getString, ApiStrings } from "../common/ApiStrings";
import Storage, { FILE_MAPPING, PATH_MAPPING } from '../common/Storage';
import Layer from '../entities/Layer';
import { BoundingTileDefinition } from '../common/GeoUtils';
import axios from 'axios';
import { OfflineRegion } from '../entities/OfflineRegion';
import { LatLng } from 'react-native-maps';

const LAYER_IDENTIFIERS = {
    LAYER_SEZNAM_AERIAL_MAPS:  "LAYER_SEZNAM_AERIAL_MAPS",
    LAYER_SEZNAM_AERIAL_MAPS_OFFLINE:  "LAYER_SEZNAM_AERIAL_MAPS_OFFLINE",
    LAYER_SEZNAM_TOURIST_MAPS: "LAYER_SEZNAM_TOURIST_MAPS",
    LAYER_OPENSTREETMAP: "LAYER_OPENSTREETMAP"
};

class OverlayStore extends BaseStore
{
    private layers: Map<string, Layer> = new Map();

    private defaultLayer: Layer;

    private offlineRegions: Map<number, OfflineRegion> = new Map<number, OfflineRegion>();

    constructor()
    {
        super();
        this.defaultLayer = new Layer("Seznam Aerial", "https://mapserver.mapy.cz/bing/{z}-{x}-{y}", "");
        this.layers.set(LAYER_IDENTIFIERS.LAYER_SEZNAM_AERIAL_MAPS, this.defaultLayer);
        this.layers.set(LAYER_IDENTIFIERS.LAYER_SEZNAM_TOURIST_MAPS, new Layer("Seznam Tourist", "https://mapserver.mapy.cz/turist-m/{z}-{x}-{y}", ""));
        this.layers.set(LAYER_IDENTIFIERS.LAYER_SEZNAM_AERIAL_MAPS_OFFLINE, new Layer("Seznam Aerial (only cached)", Storage.getMapTileTemplate(), ""));
    }

    async downloadRange(range: BoundingTileDefinition, bounds: LatLng[], progress: Function) : Promise<boolean> {
        let downloadLayer = this.layers.get(LAYER_IDENTIFIERS.LAYER_SEZNAM_AERIAL_MAPS);
        let tileCount = 0;

        let offlineRegion = new OfflineRegion();
        offlineRegion.id = this.offlineRegions.size + 1;
        offlineRegion.tileWrap = range;
        offlineRegion.boundingBox = bounds;
        // todo figure out ID

        let values = Array.from(range.boundingTiles.values());

        for (let i = 0; i < values.length; i++) {
            let row = values[i];
            
            let xRange = row.maxX - row.minX;
            let yRange = row.maxY - row.minY;
            for (let y = 0; y < yRange; y++) {
                for (let x = 0; x < xRange; x++) {
                    let tileX = row.minX + x;
                    let tileY = row.minY + y;
                    let tileZ = row.zoom;

                    let tileUrl = downloadLayer.getTileUrl().replace('{z}', tileZ.toString()).replace('{x}', tileX.toString()).replace('{y}', tileY.toString());
                    let success = await Storage.saveMapTile(tileUrl, tileX, tileY, tileZ);
                    console.log('Tile download:', success);

                    if (success) {
                        tileCount++;
                    }

                    progress(tileCount);
                }
            }
        }

        await Storage.save(PATH_MAPPING.TILE_DEFINITION + '/' + offlineRegion.id + '.json', offlineRegion);
        this.offlineRegions.set(offlineRegion.id, offlineRegion);

        return true;
    }

    async getOfflineAreas() : Promise<OfflineRegion[]>
    {
        try {
            let data = await Storage.getAllInDirectory(PATH_MAPPING.TILE_DEFINITION, OfflineRegion);
            this.offlineRegions.clear();
            for (let i = 0; i < data.length; i++) {
                this.offlineRegions.set(i, data[i] as OfflineRegion);
            }

            return Array.from(this.offlineRegions.values());
        } catch {
            return [];
        }
    }



    getOfflineLayer(): Layer {
        return this.layers.get(LAYER_IDENTIFIERS.LAYER_SEZNAM_AERIAL_MAPS_OFFLINE);
    }

    public async getAvailableLayers() : Promise<Layer[]> {
        return Array.from(this.layers.values());
    }

    public async getDefaultLayer() : Promise<Layer>
    {
        return this.defaultLayer;
    }
}

const store = new OverlayStore();

export default store;


export { LAYER_IDENTIFIERS };