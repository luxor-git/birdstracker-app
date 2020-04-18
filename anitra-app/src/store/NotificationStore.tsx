import BaseStore from './BaseStore';
import AppNotification from '../entities/AppNotification';
import { Text, View, Button, Vibration, Platform } from 'react-native';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { ApiConstants, formatPostRequest, apiRequest, formatDate } from "../common/ApiUtils";
import NetStore from './NetStore';

class NotificationStore extends BaseStore
{
    async registerForNotifications() : Promise<boolean>
    {
        if (Constants.isDevice) {
            const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
              const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
              finalStatus = status;
            }
            if (finalStatus !== 'granted') {
              return;
            }
            const token = await Notifications.getExpoPushTokenAsync();
            
            if (NetStore.getOnline()) {
              const data = new FormData();
              data.append('token', token);
              let response;
      
              try {
                  response = await apiRequest(
                    ApiConstants.API_URL + ApiConstants.API_USER + ApiConstants.API_NOTIFICATION_URL,
                    formatPostRequest(data)
                  );
              } catch (e) {
                  return false;
              }
            }
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