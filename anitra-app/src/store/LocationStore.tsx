import BaseStore from './BaseStore';
import { Tracking, LocalizedPosition, Species, Track, Position, PositionData } from '../entities/Tracking';
import AuthStore from './AuthStore';
import { ApiConstants, formatGetRequest, apiRequest, formatDate } from "../common/ApiUtils";
import { ListActionResult, EntityActionResult, BaseActionResult } from "../common/ActionResult";
import { getString, ApiStrings } from "../common/ApiStrings";
import Storage, { FILE_MAPPING, PATH_MAPPING } from '../common/Storage';
import Photo from '../entities/Photo';
import { ObservableMap } from 'mobx';
import Constants from '../constants/Constants';
import Theme from '../constants/Theme';
import netStore from './NetStore';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

const LOCATION_TASK_NAME = 'LOCATION_TASK';

interface LocationProcessor
{
    (data: Location[]) : void;
}

class LocationStore extends BaseStore
{

    private isLocationUpdating: boolean = false;

    private eventListeners: LocationProcessor[];

    public async startLocationUpdates() : Promise<BaseActionResult>
    {
        if (this.isLocationUpdating === true) {
            let actionResult = new BaseActionResult(true);
            actionResult.messages.push('Location already updating');
            return actionResult;
        }

        let actionResult = new BaseActionResult(false);
        let { status } = await Permissions.askAsync(Permissions.LOCATION);

        if (status !== 'granted') {
            actionResult.success = false;
            actionResult.messages.push('Unable to get permissions');
        } else {
            actionResult.success = true;
            this.isLocationUpdating = true;
        }

        return actionResult;
    }

    private async startLocationUpdateTask()
    {
        Location.startLocationUpdatesAsync(LOCATION_TASK_NAME,
            { accuracy: Location.Accuracy.High,
              foregroundService: {
                  notificationBody: 'Anitra is updating location in the background',
                  notificationTitle: 'Anitra location updates',
                  notificationColor: Theme.colours.brand.primary
                }
            }
        );
    }

    public async addLocationListener(eventListener: LocationProcessor)
    {
        this.eventListeners.push(eventListener);
    }

    public async pushNewLocations(locations: Location[])
    {
        this.eventListeners.forEach((x) => {
            x(locations);
        });
    }
}

const store = new LocationStore();


TaskManager.defineTask(LOCATION_TASK_NAME, ({ data: { locations: Location[] }, error }) => {
    if (error) {
        // check `error.message` for more details.
        return;
    }

    store.pushNewLocations(locations);
});

export default store;