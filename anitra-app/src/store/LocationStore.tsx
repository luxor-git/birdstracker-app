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
import { TASK_NAMES } from '../common/BackgroundSync';
import { LatLng } from 'react-native-maps';
import BackgroundSync from '../common/BackgroundSync';
import { SyncTask, SyncTaskBodyTypes } from '../common/BackgroundSync';

/**
 * Location processing function.
 *
 * @interface LocationProcessor
 */
interface LocationProcessor
{
    (data: {lat: number, lng: number}) : void;
}

interface TrackUpdateListener
{
    (data: LatLng[]) : void;
}

/**
 * Location store.
 *
 * @class LocationStore
 * @extends {BaseStore}
 */
class LocationStore extends BaseStore
{

    /**
     * True if location task is running.
     *
     * @private
     * @type {boolean}
     * @memberof LocationStore
     */
    private isLocationUpdating: boolean = false;

    private eventListeners: LocationProcessor[] = [];

    private trackUpdateListeners: TrackUpdateListener[] = [];

    private trackSegments: LatLng[] = [];

    private locationTask;

    /**
     * Temporarily pauses location updates.
     *
     * @private
     * @memberof LocationStore
     */
    private locationUpdatesPaused = false;

    /**
     * Flag to see if track is being recorded.
     *
     * @private
     * @type {boolean}
     * @memberof LocationStore
     */
    private trackRecordRunning: boolean = false;

    /**
     * Starts location update task.
     *
     * @returns {Promise<BaseActionResult>}
     * @memberof LocationStore
     */
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
            await this.startLocationUpdateTask();

            /*let location = await Location.getCurrentPositionAsync({
                enableHighAccuracy: true
            });

            this.pushNewLocation({
                lat: location.coords.latitude,
                lng: location.coords.longitude
            });*/

            actionResult.success = true;
            this.isLocationUpdating = true;
        }

        return actionResult;
    }

    /**
     *
     *
     * @returns {Promise<void>}
     * @memberof LocationStore
     */
    public async stopLocationUpdates() : Promise<void>
    {
        if (this.isLocationUpdating) {
            this.locationTask.remove();
            this.isLocationUpdating = false;
        }
    }

    /**
     * Starts location update background task.
     *
     * @private
     * @memberof LocationStore
     */
    private async startLocationUpdateTask()
    {
        this.locationTask = await Location.watchPositionAsync(
            {
                enableHighAccuracy: true,
                //timeInterval: 500,
                //timeout: 10000,
                distanceInterval: 0
            },
            (data) => {
                this.pushNewLocation({
                    lat: data.coords.latitude,
                    lng: data.coords.longitude
                })
            }
        );

        console.log('Started updating location');
        
        this.isLocationUpdating = true;
    }

    /**
     * Clears location listeners.
     *
     * @memberof LocationStore
     */
    public async clearLocationListeners()
    {
        this.eventListeners = [];
    }

    /**
     * Adds location event listener.
     *
     * @param {LocationProcessor} eventListener
     * @memberof LocationStore
     */
    public async addLocationListener(eventListener: LocationProcessor)
    {
        this.eventListeners.push(eventListener);
    }

    /**
     * Pushes new locations for location processors.
     * This needs to be public since the task is not sharing the same context.
     *
     * @param {Location[]} locations
     * @memberof LocationStore
     */
    public async pushNewLocation(location: {lat: number, lng: number})
    {
        console.log('got few listeners', this.eventListeners.length);
        this.eventListeners.forEach((x) => {
            if (this.locationUpdatesPaused) {
                return;
            }
            
            x(location);
        });
    }

    /**
     * Returns true if location update is running.
     *
     * @returns {boolean}
     * @memberof LocationStore
     */
    public isLocationUpdateRunning() : boolean
    {
        return this.isLocationUpdating;
    }

    /**
     * Returns true if track record is running.
     *
     * @returns {boolean}
     * @memberof LocationStore
     */
    public isTrackRecordRunning() : boolean
    {
        return this.trackRecordRunning;
    }

    /**
     * Starts recording track.
     *
     * @returns {Promise<void>}
     * @memberof LocationStore
     */
    public async startRecordingTrack(listener : TrackUpdateListener) : Promise<void> {
        this.trackSegments = [];
        this.trackRecordRunning = true;
        this.trackUpdateListeners = [];
        this.trackUpdateListeners.push(listener);

        await this.addLocationListener((data) => {
            console.log('hit listener',  this.trackRecordRunning);

            if (!this.trackRecordRunning) {
                return;
            }

            this.trackSegments.push({
                latitude: data.lat,
                longitude: data.lng
            } as LatLng);

            console.log('track segments length', this.trackSegments.length);

            this.trackUpdateListeners.forEach((x) => {
                x(this.trackSegments);
            });
        });
    }

    /**
     * Stops track recording, but does not clear the track array.
     *
     * @returns {Promise<void>}
     * @memberof LocationStore
     */
    public async stopRecordingTrack() : Promise<void>
    {
        this.trackRecordRunning = false;
    }

    /**
     * Saves current track.
     *
     * @returns {Promise<void>}
     * @memberof LocationStore
     */
    public async saveCurrentTrack() : Promise<void>
    {
        let task = {
            url: ApiConstants.API_URL + ApiConstants.API_TRACK_URL,
            body: this.trackSegments,
            bodyType: SyncTaskBodyTypes.JSON,
            savedAt: +new Date()
        } as SyncTask;

        await BackgroundSync.addSyncTask(task);
        this.trackSegments = [];
    }

    /**
     * Temporarily pauses location updates.
     *
     * @memberof LocationStore
     */
    public pauseLocationUpdates() {
        this.locationUpdatesPaused = true;
    }

    public resumeLocationUpdates() {
        this.locationUpdatesPaused = false;
    }

}

const store = new LocationStore();

export default store;