import AuthStore from '../store/AuthStore';
import TrackingStore from '../store/TrackingStore';

export const TASK_NAMES = {
    TASK_UPDATE_TRACKINGS: 'TASK_UPDATE_TRACKINGS'
};

class BackgroundSync
{
    async syncTrackings() : Promise<void>
    {
        //await TrackingStore.getTrackingList(true);
        console.log('run from bg');
    }

    async init() : Promise<void>
    {
        return;
    }
}

const sync = new BackgroundSync();

export default sync;