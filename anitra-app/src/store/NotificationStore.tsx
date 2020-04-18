import BaseStore from './BaseStore';
import AppNotification from '../entities/AppNotification';
import { Text, View, Button, Vibration, Platform } from 'react-native';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { ApiConstants, formatGetRequest, apiRequest, formatDate } from "../common/ApiUtils";

class NotificationStore extends BaseStore
{
    async registerForNotifications()
    {
        if (Constants.isDevice) {
            const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
              const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
              finalStatus = status;
            }
            if (finalStatus !== 'granted') {
              alert('Failed to get push token for push notification!');
              return;
            }
            const token = await Notifications.getExpoPushTokenAsync();
            console.log(token);
          } else {
            alert('Must use physical device for Push Notifications');
          }
      
          if (Platform.OS === 'android') {
            Notifications.createChannelAndroidAsync('default', {
              name: 'default',
              sound: true,
              priority: 'max',
              vibrate: [0, 250, 250, 250],
            });
          }
    }
}

const notificationStore = new NotificationStore();
export default notificationStore;