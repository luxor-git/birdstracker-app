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

/** Layer name constants */
const LAYER_IDENTIFIERS = {
    LAYER_SEZNAM_AERIAL_MAPS:  "LAYER_SEZNAM_AERIAL_MAPS",
    LAYER_SEZNAM_AERIAL_MAPS_OFFLINE:  "LAYER_SEZNAM_AERIAL_MAPS_OFFLINE",
    LAYER_SEZNAM_TOURIST_MAPS: "LAYER_SEZNAM_TOURIST_MAPS",
    LAYER_OPENSTREETMAP: "LAYER_OPENSTREETMAP"
};

/**
 * Overlay store
 *
 * @class OverlayStore
 * @extends {BaseStore}
 */
class OverlayStore extends BaseStore
{
    /**
     * Available layers map.
     *
     * @private
     * @type {Map<string, Layer>}
     * @memberof OverlayStore
     */
    private layers: Map<string, Layer> = new Map();

    /**
     * Default layer reference.
     *
     * @private
     * @type {Layer}
     * @memberof OverlayStore
     */
    private defaultLayer: Layer;

    /**
     * List of off-line regions to display.
     *
     * @private
     * @type {Map<number, OfflineRegion>}
     * @memberof OverlayStore
     */
    private offlineRegions: Map<number, OfflineRegion> = new Map<number, OfflineRegion>();

    /**
     * Creates an instance of OverlayStore.
     * Initializes layers.
     * @memberof OverlayStore
     */
    constructor() {
        super();
        this.defaultLayer = new Layer("Seznam Aerial", "https://mapserver.mapy.cz/bing/{z}-{x}-{y}", "");
        this.layers.set(LAYER_IDENTIFIERS.LAYER_SEZNAM_AERIAL_MAPS, this.defaultLayer);
        this.layers.set(LAYER_IDENTIFIERS.LAYER_SEZNAM_TOURIST_MAPS, new Layer("Seznam Tourist", "https://mapserver.mapy.cz/turist-m/{z}-{x}-{y}", ""));
        this.layers.set(LAYER_IDENTIFIERS.LAYER_SEZNAM_AERIAL_MAPS_OFFLINE, new Layer("Seznam Aerial (only cached)", Storage.getMapTileTemplate(), ""));
    }

    /**
     * Downloads a range for off-line use.
     *
     * @param {BoundingTileDefinition} range
     * @param {LatLng[]} bounds
     * @param {Function} progress
     * @returns {Promise<boolean>}
     * @memberof OverlayStore
     */
    public async downloadRange(range: BoundingTileDefinition, bounds: LatLng[], progress: Function) : Promise<boolean> {
        let downloadLayer = this.layers.get(LAYER_IDENTIFIERS.LAYER_SEZNAM_AERIAL_MAPS);
        let tileCount = 0;

        let offlineRegion = new OfflineRegion();
        offlineRegion.id = this.offlineRegions.size + 1;
        offlineRegion.tileWrap = range;
        offlineRegion.boundingBox = bounds;

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

    /**
     * Gets a list of available off-line areas.
     *
     * @returns {Promise<OfflineRegion[]>}
     * @memberof OverlayStore
     */
    public async getOfflineAreas() : Promise<OfflineRegion[]>
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

    /**
     * Returns the pointer to off-line aerial maps.
     *
     * @returns {Layer}
     * @memberof OverlayStore
     */
    public getOfflineLayer(): Layer {
        return this.layers.get(LAYER_IDENTIFIERS.LAYER_SEZNAM_AERIAL_MAPS_OFFLINE);
    }

    /**
     * Lists available layers.
     *
     * @returns {Promise<Layer[]>}
     * @memberof OverlayStore
     */
    public async getAvailableLayers() : Promise<Layer[]> {
        return Array.from(this.layers.values());
    }

    /**
     * Returns pointer to the default layer.
     *
     * @returns {Promise<Layer>}
     * @memberof OverlayStore
     */
    public async getDefaultLayer() : Promise<Layer>
    {
        return this.defaultLayer;
    }
}

const store = new OverlayStore();

export default store;

export { LAYER_IDENTIFIERS };