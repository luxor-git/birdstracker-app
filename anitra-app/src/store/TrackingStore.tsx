import BaseStore from './BaseStore';
import { Tracking, LocalizedPosition, Species, Track, Position } from '../entities/Tracking';
import AuthStore from './AuthStore';
import { ApiConstants, formatGetRequest, apiRequest, formatDate } from "../common/ApiUtils";
import { ListActionResult, EntityActionResult } from "../common/ActionResult";
import { getString, ApiStrings } from "../common/ApiStrings";
import Storage, { FILE_MAPPING } from '../common/Storage';
import Photo from '../entities/Photo';
import { ObservableMap } from 'mobx';

class TrackingStore extends BaseStore
{
    //private trackings: Map<number, Tracking> = new Map();

    private species: Map<number, Species> = new Map();

    //private loadedTrackings: ObservableMap<number, Tracking> = new ObservableMap();

    public async getTrackingList(forceRefresh: boolean = false) : Promise<ListActionResult<Tracking>>
    {
        // todo - TIMEOUT & NET CHECK
        let result = new ListActionResult<Tracking>(false);

        let fromCache = await Storage.fileExists(FILE_MAPPING.TRACKINGS);

        try {
            if (fromCache && !forceRefresh) {
                let collection = await Storage.loadCollection(FILE_MAPPING.TRACKINGS, Tracking, true);
                result.data = collection as Tracking[];
                result.success = true;
                return result;
            }
        } catch {

        }

        const apiToken = await AuthStore.getAuthToken();

        let response = await apiRequest(
            ApiConstants.API_TRACKED_OBJECT + '/' + ApiConstants.API_LIST,
            formatGetRequest(apiToken)
        );

        if (response.success) {
            let trackingData : Tracking[] = [];

            if (response.data.list) {
                for (let i = 0; i < response.data.list.length; i++) {
                    let t = await this.trackingFromList(response.data.list[i]);
                    if (t) {
                        trackingData.push(t);
                    }
                }
            }

            console.log('Saving file');
            await Storage.saveCollection(FILE_MAPPING.TRACKINGS, trackingData);
            console.log('Saved file');

            result.success = true;
            result.data = trackingData;
        }

        return result;
    }

    public async getTracking(id :number, forceRefresh: boolean = false) : Promise<EntityActionResult<Tracking>>
    {
        let res = new EntityActionResult<Tracking>(false);

        const allTrackings = await this.getTrackingList(forceRefresh);

        if (allTrackings.data) {
            for (let i = 0; i < allTrackings.data.length; i++) {
                if (allTrackings.data[i].id == id) {
                    res.data = allTrackings.data[i];
                    res.success = true;
                    break;
                }
            }
        }

        return res;
    }

    private async trackingFromList(trackingRow: any) : Promise<Tracking> {
        let tracking = new Tracking();

        tracking.id = trackingRow["TrackedObjectId"];
        tracking.code = trackingRow["TrackedObjectCode"];
        tracking.name = trackingRow["TrackedObjectName"];
        tracking.note = trackingRow["TrackedObjectNote"];
        tracking.sex = trackingRow["IndividualSex"];
        tracking.age = trackingRow["CurrentAge"];
        tracking.deviceCode = trackingRow["DeviceCode"];
        tracking.species = await this.getSpeciesById(parseInt(trackingRow["SpeciesID"]));

        tracking.deviceId = trackingRow["DeviceId"];

        if (trackingRow["LastPositionAdmin1"]) {
            let pos = new LocalizedPosition();
            pos.admin1 = trackingRow["LastPositionAdmin1"];
            pos.admin2 = trackingRow["LastPositionAdmin2"];
            pos.country = trackingRow["LastPositionCountry"];
            pos.settlement = trackingRow["LastPositionSettlement"];
            pos.lat = parseFloat(trackingRow["LastPositionLatitude"]);
            pos.lng = parseFloat(trackingRow["LastPositionLongitude"]);
            pos.date = formatDate(trackingRow["LastPositionTime"]);
            tracking.lastPosition = pos;
        }

        if (trackingRow["FirstPositionAdmin1"]) {
            let pos = new LocalizedPosition();
            pos.admin1 = trackingRow["FirstPositionAdmin1"];
            pos.admin2 = trackingRow["FirstPositionAdmin2"];
            pos.country = trackingRow["FirstPositionCountry"];
            pos.settlement = trackingRow["LastPositionSettlement"];
            pos.lat = parseFloat(trackingRow["FirstPositionLatitude"]);
            pos.lng = parseFloat(trackingRow["FirstPositionLongitude"]);
            pos.date = formatDate(trackingRow["StartGpsTime"]);
            tracking.firstPosition = pos;
        }

        return tracking;
    }

    public async getSpecies(): Promise<ListActionResult<Species>> {
        let result = new ListActionResult<Species>(false);
        let fromCache = await Storage.fileExists(FILE_MAPPING.SPECIES);

        if (fromCache) {
            let collection = await Storage.loadCollection(FILE_MAPPING.SPECIES, Species);

            if (collection.length) {
                for (let i = 0; i < collection.length; i++) {
                    this.species.set(collection[i].id, collection[i] as Species);
                }
    
                result.data = collection as Species[];
    
                result.success = true;
    
                return result;
            }
        }

        const apiToken = await AuthStore.getAuthToken();

        let response = await apiRequest(
            ApiConstants.API_LIST + '/' + ApiConstants.API_SPECIES,
            formatGetRequest(apiToken)
        );

        if (response.success) {
            let speciesData : Species[] = [];

            if (response.data) {
                let data = response.data.data;
                for (let i = 0; i < data.length; i++) {
                    let species = new Species();
                    species.id = parseInt(data[i].Id);
                    species.scientificName = data[i]["SpeciesName_Scientific"];
                    species.englishName = data[i]["SpeciesName_English"];
                    speciesData.push(species);
                    this.species.set(species.id, species);
                }
            }

            console.log('Saving file');
            await Storage.saveCollection(FILE_MAPPING.SPECIES, speciesData);
            console.log('Saved file');

            result.success = true;
            result.data = speciesData;
        }

        return result;
    }

    public async getSpeciesById(id: number) : Promise<Species>
    {
        if (this.species.size === 0) {
            await this.getSpecies();
        }

        return this.species.get(id);
    }

    public async getPhotos(id: number) : Promise<ListActionResult<Photo>>
    {
        ///api/v1/tracked-object/gallery/1591
        const apiToken = await AuthStore.getAuthToken();

        let response = await apiRequest(
            ApiConstants.API_TRACKED_OBJECT + '/' + ApiConstants.API_GALLERY + '/' + id,
            formatGetRequest(apiToken)
        );

        let photos: Photo[] = [];

        if (response.success) {
            if (response.data.galleries) {
                for (let i = 0; i < response.data.galleries.length; i++) {
                    for (let j = 0; j < response.data.galleries[i].photos.length; i++) {
                        let photo = new Photo();
                        let json = response.data.galleries[i].photos[j];
                        console.log(json);
                        photo.id = json.fileId;
                        photo.fileCreateDate = new Date(json.fileCreateDate);
                        photo.thumbPath = json.thumbPath;
                        photo.fullPath = json.relativePath;
                        photo.uploaderName = [json.uploaderFirstName, json.uploaderLastName].join(' ');
                        photos.push(photo);
                    }
                }
            }
        }

        let ret = new ListActionResult<Photo>(true);
        ret.data = photos;

        return ret;
    }

    public async getTrack(id: number, count: number) : Promise<Track>
    {
        const apiToken = await AuthStore.getAuthToken();

        let response = await apiRequest(
            ApiConstants.API_TRACKED_OBJECT + '/' + ApiConstants.API_TRACK + '/' + id,
            formatGetRequest(apiToken)
        );

        let positions : Position[] = [];

        if (response.data?.data) {
            let posArr = response.data?.data;

            for (let i = 0; i < posArr.length; i++) {
                positions.push({ lat: posArr[i].lat, lng: posArr[i].lng, timestamp: posArr[i].time, id: posArr[i].Id } as Position);
            }
        }

        let track = new Track();

        track.id = id;
        track.positions = positions;

        return track;
    }

}

const store = new TrackingStore();

export default store;