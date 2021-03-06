import { LatLng } from "react-native-maps";

/**
 * A single map tile.
 *
 * @export
 * @interface MapTile
 */
export interface MapTile 
{
    x: number;
    y: number;
    z: number;
}

/**
 * Map bounds.
 *
 * @export
 * @interface BoundingTileDefinition
 */
export interface BoundingTileDefinition
{
    boundingTiles: Map<number, BoundingTileRow>;
    corners: LatLng[];
    tileCount: number;
}

/**
 * Row of bounding tile.
 *
 * @export
 * @interface BoundingTileRow
 */
export interface BoundingTileRow
{
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    zoom: number;
}

/**
 * Transforms longitude delta to zoom.
 * Slippy maps work with zoom levels, while mobile maps work with deltas.
 * Transformation is necessary to get anything useful out of web map services.
 *
 * @export
 * @param {number} longitudeDelta
 * @returns
 */
export function lonDeltaToZoom (longitudeDelta: number) {
    return Math.round(Math.log(360 / longitudeDelta) / Math.LN2);
};

/**
 * Returns a tile for a given lat lng pair.
 *
 * @export
 * @param {number} lat
 * @param {number} lng
 * @param {number} zoom
 * @returns {MapTile}
 */
export function getLatLngTile(lat: number, lng: number, zoom: number) : MapTile
{
    let tile = { x : null, y: null, z: zoom } as MapTile;

    let latRad = lat * ( Math.PI / 180.0);

    let n = Math.pow(2, zoom);

    tile.x = Math.floor(((lng + 180.0) / 360.0)  * n);

    tile.y = Math.floor((1.0 - Math.asinh(
        Math.tan(latRad)
    ) / Math.PI) / 2.0 * n);

    return tile;
}

/**
 * Gets all tiles for given bounding points and zoom levels.
 *
 * @export
 * @param {LatLng[]} points
 * @param {number[]} zoomLevels
 * @returns {BoundingTileDefinition}
 */
export function getBoundingTileArray(points: LatLng[], zoomLevels: number[]) : BoundingTileDefinition
{
    let tileMap = new Map<number, BoundingTileRow>();
    let tileCount = 0;

    for (let i = 0; i < zoomLevels.length; i++) {
        let zoom = zoomLevels[i];
        let tileBoundsXMin = null;
        let tileBoundsXMax = null;
        let tileBoundsYMin = null;
        let tileBoundsYMax = null;

        for (let j = 0; j < points.length; j++) {
            let tile = getLatLngTile(points[j].latitude, points[j].longitude, zoom);
    
            if (tileBoundsXMin === null) {
                tileBoundsXMin = tile.x;
                tileBoundsXMax = tile.x;
                tileBoundsYMin = tile.y;
                tileBoundsYMax = tile.y;
            }
    
            tileBoundsXMin = Math.min(tile.x, tileBoundsXMin);
            tileBoundsXMax = Math.max(tile.x, tileBoundsXMax);
    
            tileBoundsYMin = Math.min(tile.y, tileBoundsYMin);
            tileBoundsYMax = Math.max(tile.y, tileBoundsYMax);
        }

        let row = {
            minX: tileBoundsXMin - 2,
            maxX: tileBoundsXMax + 2,
            minY: tileBoundsYMin - 2,
            maxY: tileBoundsYMax + 2,
            zoom: zoom
        } as BoundingTileRow;

        tileCount += (row.maxX - row.minX) * (row.maxY -row.minY);

        tileMap.set(zoom, row);
    }


    return { 
        boundingTiles: tileMap,
        tileCount: tileCount,
        corners: points
    } as BoundingTileDefinition;
}