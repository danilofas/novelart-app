import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform, PermissionsAndroid} from 'react-native';

const FCM_TOKEN_KEY = 'fcmToken';

class NotificationService {
  private isInitialized = false;

  // Initialize notification service
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await this.requestPermission();
    await this.setupMessageHandlers();
    this.isInitialized = true;
  }

  // Request notification permissions
  async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission denied');
          return false;
        }
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted');
        await this.registerForRemoteMessages();
        return true;
      }

      console.log('Notification permission denied');
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Register for remote messages
  private async registerForRemoteMessages(): Promise<void> {
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }
  }

  // Get FCM token
  async getFCMToken(): Promise<string | null> {
    try {
      // Check for stored token first
      const storedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);

      // Get current token
      const currentToken = await messaging().getToken();

      // If token changed, update storage
      if (currentToken !== storedToken) {
        await AsyncStorage.setItem(FCM_TOKEN_KEY, currentToken);
        // TODO: Send new token to backend
        await this.sendTokenToBackend(currentToken);
      }

      return currentToken;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Send token to backend
  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      // TODO: Implement API call to send token to backend
      console.log('FCM Token:', token);
      // await api.post('/user/fcm-token', { token });
    } catch (error) {
      console.error('Error sending FCM token to backend:', error);
    }
  }

  // Setup message handlers
  private async setupMessageHandlers(): Promise<void> {
    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
      this.handleForegroundMessage(remoteMessage);
    });

    // Handle background/quit state messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message received:', remoteMessage);
      return this.handleBackgroundMessage(remoteMessage);
    });

    // Handle notification that opened the app
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app:', remoteMessage);
      this.handleNotificationOpen(remoteMessage);
    });

    // Check if app was opened from quit state by notification
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      console.log('App opened from quit state by notification:', initialNotification);
      this.handleNotificationOpen(initialNotification);
    }

    // Handle token refresh
    messaging().onTokenRefresh(async token => {
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      await this.sendTokenToBackend(token);
    });
  }

  // Handle foreground message
  private handleForegroundMessage(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ): void {
    // Display local notification or update UI
    const {notification, data} = remoteMessage;

    if (notification) {
      // You can show a local notification or in-app alert here
      console.log('Notification title:', notification.title);
      console.log('Notification body:', notification.body);
    }

    if (data) {
      // Handle data payload
      console.log('Data payload:', data);
    }
  }

  // Handle background message
  private handleBackgroundMessage(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ): Promise<void> {
    return new Promise(resolve => {
      // Process background message if needed
      console.log('Processing background message:', remoteMessage);
      resolve();
    });
  }

  // Handle notification open
  private handleNotificationOpen(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ): void {
    const {data} = remoteMessage;

    if (data) {
      // Navigate based on notification data
      // Example: navigate to specific novel or chapter
      if (data.novelId) {
        // TODO: Navigate to novel detail screen
        console.log('Navigate to novel:', data.novelId);
      }
      if (data.chapterId) {
        // TODO: Navigate to chapter reader screen
        console.log('Navigate to chapter:', data.chapterId);
      }
    }
  }

  // Subscribe to topic
  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
    }
  }

  // Unsubscribe from topic
  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
    }
  }

  // Check notification permission status
  async getPermissionStatus(): Promise<FirebaseMessagingTypes.AuthorizationStatus> {
    return await messaging().hasPermission();
  }

  // Delete FCM token (for logout)
  async deleteToken(): Promise<void> {
    try {
      await messaging().deleteToken();
      await AsyncStorage.removeItem(FCM_TOKEN_KEY);
    } catch (error) {
      console.error('Error deleting FCM token:', error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
