import BaseStore from './BaseStore';
import AppNotification from '../entities/AppNotification';

class NotificationStore extends BaseStore
{

    async getLatestNotifications(): Promise< AppNotification[] >
    {
        let first = new AppNotification();
        first.id = 1;
        return [];
    }

}