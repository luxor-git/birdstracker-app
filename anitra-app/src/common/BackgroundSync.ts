import AuthStore from '../store/AuthStore';
import TrackingStore from '../store/TrackingStore';
import Storage from '../common/Storage';

export const TASK_NAMES = {
    TASK_UPDATE_TRACKINGS: 'TASK_UPDATE_TRACKINGS',
    LOCATION_TASK: 'LOCATION_TASK'
};

export enum SyncTaskBodyTypes 
{
    JSON,
    FORM_DATA
}

/**
 * Sync task definition.
 *
 * @interface SyncTask
 */
export interface SyncTask
{
    /**
     * URL of the API endpoint.
     *
     * @type {string}
     * @memberof SyncTask
     */
    url: string;

    /**
     * HTTP method.
     *
     * @type {string}
     * @memberof SyncTask
     */
    method: string;

    /**
     * Body to send to the server.
     *
     * @type {*}
     * @memberof SyncTask
     */
    body: any;

    /**
     * Body type.
     *
     * @type {SyncTaskBodyTypes}
     * @memberof SyncTask
     */
    bodyType: SyncTaskBodyTypes;

    /**
     * Timestamp.
     *
     * @type {number}
     * @memberof SyncTask
     */
    savedAt: number;

    /**
     * File name of the task.
     *
     * @type {?string}
     * @memberof SyncTask
     */
    fileName: string;
}

class BackgroundSync
{

    /**
     * Synchronizes trackings.
     *
     * @returns {Promise<void>}
     * @memberof BackgroundSync
     */
    async syncTrackings() : Promise<void> {
        //await TrackingStore.getTrackingList(true);
        //console.log('run from bg');
    }

    /**
     * Initializes the background sync.
     *
     * @returns {Promise<void>}
     * @memberof BackgroundSync
     */
    async init() : Promise<void> {
        return;
    }

    /**
     * Adds sync task.
     *
     * @param {SyncTask} task
     * @returns {Promise<void>}
     * @memberof BackgroundSync
     */
    async addSyncTask(task: SyncTask) : Promise<void>
    {
        await Storage.saveSyncTask(task);

        console.log(await Storage.getSyncTasks());
    }


}

const sync = new BackgroundSync();

export default sync;