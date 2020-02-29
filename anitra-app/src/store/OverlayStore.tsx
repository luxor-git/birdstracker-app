import BaseStore from './BaseStore';
import AuthStore from './AuthStore';
import { ApiConstants, formatGetRequest, apiRequest, formatDate } from "../common/ApiUtils";
import { ListActionResult, EntityActionResult } from "../common/ActionResult";
import { getString, ApiStrings } from "../common/ApiStrings";
import Storage, { FILE_MAPPING } from '../common/Storage';
import Layer from '../entities/Layer';

const LAYER_IDENTIFIERS = {
    LAYER_SEZNAM_AERIAL_MAPS:  "LAYER_SEZNAM_AERIAL_MAPS",
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
        this.defaultLayer = new Layer("Seznam Tourist", "https://mapserver.mapy.cz/base-m/retina/{z}-{x}-{y}", "");
        this.layers.set(LAYER_IDENTIFIERS.LAYER_SEZNAM_AERIAL_MAPS, this.defaultLayer);
        this.layers.set(LAYER_IDENTIFIERS.LAYER_SEZNAM_TOURIST_MAPS, new Layer("Seznam Aerial", "https://mapserver.mapy.cz/bing/{z}-{x}-{y}", ""));
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