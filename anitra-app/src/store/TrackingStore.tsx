import BaseStore from './BaseStore';
import { Tracking } from '../entities/Tracking';

class TrackingStore extends BaseStore
{

    public async getTrackingList() : Promise<Tracking[]>
    {
        const track = new Tracking();
        track.id = 1;
        track.name = "Test tracking";

        return new Promise((resolve, reject) => {
            resolve(
                [
                    track
                ]
            )
        });

        return [];
    }

}

const store = new TrackingStore();

export default store;