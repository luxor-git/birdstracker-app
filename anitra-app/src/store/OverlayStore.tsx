import BaseStore from './BaseStore';
import AuthStore from './AuthStore';
import { ApiConstants, formatGetRequest, apiRequest, formatDate } from "../common/ApiUtils";
import { ListActionResult, EntityActionResult } from "../common/ActionResult";
import { getString, ApiStrings } from "../common/ApiStrings";
import Storage, { FILE_MAPPING } from '../common/Storage';
import Layer from '../entities/Layer';
import { BoundingTileDefinition } from '../common/GeoUtils';
import axios from 'axios';

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

    constructor()
    {
        super();
        this.defaultLayer = new Layer("Seznam Aerial", "https://mapserver.mapy.cz/bing/{z}-{x}-{y}", "");
        this.layers.set(LAYER_IDENTIFIERS.LAYER_SEZNAM_AERIAL_MAPS, this.defaultLayer);
        this.layers.set(LAYER_IDENTIFIERS.LAYER_SEZNAM_TOURIST_MAPS, new Layer("Seznam Tourist", "https://mapserver.mapy.cz/turist-m/{z}-{x}-{y}", ""));
        this.layers.set(LAYER_IDENTIFIERS.LAYER_SEZNAM_AERIAL_MAPS_OFFLINE, new Layer("Seznam Aerial (only cached)", Storage.getMapTileTemplate(), ""));
    }

    async downloadRange(range: BoundingTileDefinition, progress: Function) : Promise<boolean> {
        let downloadLayer = this.layers.get(LAYER_IDENTIFIERS.LAYER_SEZNAM_AERIAL_MAPS);
        let tileCount = 0;

        let values = Array.from(range.boundingTiles.values());

        for (let i = 0; i < values.length; i++) {
            let row = values[i];
            
            let xRange = row.maxX - row.minX;
            let yRange = row.maxY - row.minY;
            for (let y = 0; y < yRange; y++) {
                for (let x = 0; x < xRange; x++) {
                    tileCount++;
                    let tileX = row.minX + x;
                    let tileY = row.minY + y;
                    let tileZ = row.zoom;

                    let tileUrl = downloadLayer.getTileUrl().replace('{z}', tileZ.toString()).replace('{x}', tileX.toString()).replace('{y}', tileY.toString());
                    let success = await Storage.saveMapTile(tileUrl, tileX, tileY, tileZ);
                    console.log('Tile download:', success);
                    progress(tileCount);
                }
            }
        }

        return true;
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