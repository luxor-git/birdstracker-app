import BaseStore from './BaseStore';
import { Tracking, LocalizedPosition, Species } from '../entities/Tracking';
import AuthStore from './AuthStore';
import { ApiConstants, formatGetRequest, apiRequest, formatDate } from "../common/ApiUtils";
import { ListActionResult } from "../common/ActionResult";
import { getString, ApiStrings } from "../common/ApiStrings";
import Storage, { FILE_MAPPING } from '../common/Storage';

class TrackingStore extends BaseStore
{
    private trackings: Map<number, Tracking> = new Map();

    public async getTrackingList() : Promise<ListActionResult<Tracking>>
    {
        // todo - TIMEOUT & NET CHECK
        let result = new ListActionResult<Tracking>(false);

        let fromCache = await Storage.fileExists(FILE_MAPPING.TRACKINGS);

        if (fromCache) {
            console.log('yes');
            let collection = await Storage.loadCollection(FILE_MAPPING.TRACKINGS, Tracking);
            console.log(collection);
            console.log('...');
            result.success = true;
            //result.data = collection;
            return result;
        }

        const apiToken = await AuthStore.getAuthToken();

        let response = await apiRequest(
            ApiConstants.API_TRACKED_OBJECT + '/' + ApiConstants.API_LIST,
            formatGetRequest(apiToken)
        );

        if (response.success) {
            let trackingData : Tracking[] = [];

            if (response.data.list) {
                await response.data.list.forEach((x) => {
                    let t = this.trackingFromList(x);
                    if (t) {
                        trackingData.push(t);
                    }
                });
            }

            console.log('Saving file');
            await Storage.saveCollection(FILE_MAPPING.TRACKINGS, trackingData);
            console.log('Saved file');

            result.success = true;
            result.data = trackingData;
        }

        return result;
    }

    private trackingFromList(trackingRow: any) : Tracking {
        let tracking = new Tracking();

        tracking.id = tracking["TrackedObjectId"];
        tracking.code = trackingRow["TrackedObjectCode"];
        tracking.name = trackingRow["TrackedObjectName"];
        tracking.note = trackingRow["TrackedObjectNote"];

        tracking.deviceId = trackingRow["DeviceId"];

        if (trackingRow["LastPositionAdmin1"]) {
            let pos = new LocalizedPosition();
            pos.admin1 = trackingRow["LastPositionAdmin1"];
            pos.admin2 = trackingRow["LastPositionAdmin2"];
            pos.country = trackingRow["LastPositionCountry"];
            pos.settlement = trackingRow["LastPositionSettlement"];
            pos.lat = parseFloat(trackingRow["LastPositionLatitude"]);
            pos.lat = parseFloat(trackingRow["LastPositionSettlement"]);
            pos.date = formatDate(trackingRow["LastPositionTime"]);
            tracking.firstPosition = pos;
        }

        if (trackingRow["FirstPositionAdmin1"]) {
            let pos = new LocalizedPosition();
            pos.admin1 = trackingRow["FirstPositionAdmin1"];
            pos.admin2 = trackingRow["FirstPositionAdmin2"];
            pos.country = trackingRow["FirstPositionCountry"];
            pos.settlement = trackingRow["LastPositionSettlement"];
            pos.lat = parseFloat(trackingRow["FirstPositionLatitude"]);
            pos.lat = parseFloat(trackingRow["FirstPositionLongitude"]);
            pos.date = formatDate(trackingRow["StartGpsTime"]);
            tracking.firstPosition = pos;
        }

        return tracking;
    }

}

const store = new TrackingStore();

export default store;