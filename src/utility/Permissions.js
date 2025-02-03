import { Alert, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';
import Constants from 'expo-constants';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Settings } from 'react-native-fbsdk-next';
import * as Gateway from '../services/Gateway';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';

export const handleTrackingPermissions = async () => {
    const { status } = await requestTrackingPermissionsAsync();

    if (status === 'granted') {
        await Settings.setAdvertiserTrackingEnabled(true);
    }
};

export const registerForPushNotifications = async () => {
    const { status: existingNotificationStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingNotificationStatus;

    if (existingNotificationStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus === 'granted') {
        try {
            const expoToken = (await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig.extra.eas.projectId,
            })).data;
        
            const { data: devicePushToken } = await Notifications.getDevicePushTokenAsync();
        
            await AsyncStorage.setItem('ExpoToken', expoToken);
            await AsyncStorage.setItem('DeviceToken', devicePushToken);
        }
        catch (e) {
            Gateway.Exception('Permissions::registerForPushNotifications', e.message, 'ERROR - Could not store token in AsyncStorage');
        }
    }

    else if (finalStatus === 'denied') {
        const hasShownAlert = await AsyncStorage.getItem('hasShownNotificationAlert');
        if (!hasShownAlert) {
            Alert.alert(
                'Notifications Disabled',
                'Please enable notifications in the app settings to receive important updates.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => openAppSettings() },
                ]
            );
            await AsyncStorage.setItem('hasShownNotificationAlert', 'true');
        }
        return;
    }
};

export const requestCameraPermission = async () => {
    const { status: existingCameraStatus } = await Camera.getCameraPermissionsAsync();
    let finalCameraStatus = existingCameraStatus;

    if (existingCameraStatus !== 'granted') {
        const { status } = await Camera.requestCameraPermissionsAsync();
        finalCameraStatus = status;
    }

    if (finalCameraStatus === 'denied') {
        const hasShownAlert = await AsyncStorage.getItem('hasShownCameraPermissionAlert');
        if (!hasShownAlert) {
            Alert.alert(
                'Camera Disabled',
                'This app requires access to the camera to take photos.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => openAppSettings() },
                ]
            );
            await AsyncStorage.setItem('hasShownCameraPermissionAlert', 'true');
        }
        return false;
    }

    return finalCameraStatus === 'granted';
};

export const requestGalleryPermission = async () => {
    const { status: imagePickerStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
    let finalImagePickerStatus = imagePickerStatus;

    if (imagePickerStatus !== 'granted') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        finalImagePickerStatus = status;
    }

    if (finalImagePickerStatus === 'denied') {
        const hasShownAlert = await AsyncStorage.getItem('hasShownGalleryPermissionAlert');

        if (!hasShownAlert) {
            Alert.alert(
                'Access to gallery denied',
                'This app requires access to the photo library to upload photos.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => openAppSettings() },
                ]
            );
            await AsyncStorage.setItem('hasShownGalleryPermissionAlert', 'true');
        }
        return false;
    }

    return finalImagePickerStatus === 'granted';
};

export const openAppSettings = () => {
    if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
    }
    
    else {
        Linking.openSettings();
    }
};