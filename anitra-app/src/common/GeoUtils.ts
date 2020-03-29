import { LatLng } from "react-native-maps";

export interface MapTile 
{
    x: number;
    y: number;

    z: number;
}

export interface BoundingTileDefinition
{
    boundingTiles: Map<number, BoundingTileRow>;
    corners: LatLng[];
    tileCount: number;
}

export interface BoundingTileRow
{
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    zoom: number;
}

export function lonDeltaToZoom (longitudeDelta: number) {
    return Math.round(Math.log(360 / longitudeDelta) / Math.LN2);
};

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