import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const createLogoutUrl = async () => {
    const expoToken = await AsyncStorage.getItem('ExpoToken');
    const deviceToken = await AsyncStorage.getItem('DeviceToken');
    let logoutUrl = '/logout';
    const queryParams = [];

    if (expoToken) {
        queryParams.push(`et=${expoToken}`);
    }

    if (deviceToken) {
        if (Platform.OS == 'android') {
            queryParams.push(`apn=${deviceToken}`);
        } 
        
        else if (Platform.OS == 'ios') {
            queryParams.push(`fcn=${deviceToken}`);
        }
    }

    if (queryParams.length > 0) {
        logoutUrl += '?' + queryParams.join('&');
    }

    return logoutUrl;
};

export const openAppSettings = () => {
    if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
    }
    
    else {
        Linking.openSettings();
    }
};