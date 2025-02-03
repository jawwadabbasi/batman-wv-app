import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, StatusBar, Platform, Linking, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { RegisterInjection, LoginInjection, LogoutInjection } from '../injections/JavascriptInjection';
import { requestCameraPermission, createLogoutUrl, openAppSettings } from '../utility';
import * as Loader from './Loading';
import * as Gateway from '../services/Gateway';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

const Batapp = ({ route, navigation }) => {
	const webViewRef = useRef(null);
	const [error, setError] = useState(false);

	const initialUrl = route.params?.initialUrl ? `${process.env.EXPO_PUBLIC_API_URL}${route.params.initialUrl}` : process.env.EXPO_PUBLIC_API_URL;

	useEffect(() => {
		clearNotifications();

	}, []);

	useEffect(() => {
		if (route.params?.notificationUrl) {
			navigation.navigate('Page', { initialUrl: `${process.env.EXPO_PUBLIC_API_URL}${route.params.notificationUrl}` });
		}

	}, [route.params?.notificationUrl]);

	const clearNotifications = () => {
        Notifications.dismissAllNotificationsAsync();
        Notifications.setBadgeCountAsync(0);
    };

	const handleUrlActions = async (navStateUrl) => {
		if (navStateUrl === `${process.env.EXPO_PUBLIC_API_URL}/register`) {
			const expoToken = await AsyncStorage.getItem('ExpoToken');
			const deviceToken = await AsyncStorage.getItem('DeviceToken');

			webViewRef.current.injectJavaScript(
				RegisterInjection(
					Platform.OS,
					expoToken,
					deviceToken,
					Device.modelName,
					Device.brand,
					Device.osVersion,
					Device.manufacturer,
				)
			);
		}

		if (navStateUrl === `${process.env.EXPO_PUBLIC_API_URL}/login`) {
			const expoToken = await AsyncStorage.getItem('ExpoToken');
			const deviceToken = await AsyncStorage.getItem('DeviceToken');

			webViewRef.current.injectJavaScript(
				LoginInjection(
					Platform.OS,
					expoToken,
					deviceToken,
					Device.modelName,
					Device.brand,
					Device.osVersion,
					Device.manufacturer,
				)
			);
		}

		if (navStateUrl === `${process.env.EXPO_PUBLIC_API_URL}/account/manage`) {
			const expoToken = await AsyncStorage.getItem('ExpoToken');
			const deviceToken = await AsyncStorage.getItem('DeviceToken');

			webViewRef.current.injectJavaScript(
				LogoutInjection(
					Platform.OS,
					expoToken, 
					deviceToken
				)
			);
		}

		if (navStateUrl === `${process.env.EXPO_PUBLIC_API_URL}/logout`) {
			await AsyncStorage.clear();
		}
	};

	const handleNavigationChange = async (navState) => {
		handleUrlActions(navState.url);
	};

	const handleShouldStartLoadWithRequest = (request) => {
		const url = request.url;
		const urlPath = new URL(url).pathname;
	
		if (urlPath === '/') {
			return true;
		}

		if (url.includes('/pricing')) {
			navigation.navigate('Pricing');
			return false;
		}

		if (url.startsWith('https://wa.me')) {
			Linking.openURL(url);
			return false;
		}

		if (url.startsWith('https://youtube.com')) {
			Linking.openURL(url);
			return false;
		}

		if (url.includes('/terms-and-conditions')) {
			Linking.openURL('https://batman.com/terms-and-conditions');
			return false;
		}

		if (url.includes('/privacy-policy')) {
			Linking.openURL('https://batman.com/privacy-policy');
			return false;
		}
	
		const internalPaths = [
			'/batman/search',
			'/batman/create',
			'/batman/update',
			'/batman/manage',
		];
	
		if (internalPaths.some(path => url.includes(path))) {
			return true;
		}
	
		navigation.navigate('Page', { initialUrl: url });
	
		return false;
	};

	const handleOnLoad = (syntheticEvent) => {
		const { nativeEvent } = syntheticEvent;

		if (nativeEvent.url.includes('/pricing')) {
			navigation.navigate('Pricing');
			return;
		}

		handleUrlActions(nativeEvent.url);
	};

	const handleOnMessage = async (event) => {
		try {
			const { payload } = JSON.parse(event.nativeEvent.data);

			if (payload.userId) {
				await AsyncStorage.setItem('UserId', payload.userId);
			}

			if (payload.cookie) {
				await AsyncStorage.setItem('Cookie', payload.cookie);
			}

			if (payload.action == 'redirect') {
				const redirectUrl = payload.url ? (payload.url.startsWith('/') ? payload.url : `/${payload.url}`) : '';
				navigation.reset({
					index: 0,
					routes: [{
						name: 'Batapp',
						params: {
							initialUrl: redirectUrl,
							defaultLoadingScreen: true
						}
					}],
				});
				return;
			}

			if (payload.action == 'logout') {
				const logoutUrl = await createLogoutUrl();

				navigation.reset({
					index: 0,
					routes: [{
						name: 'Batapp',
						params: {
							initialUrl: logoutUrl,
							defaultLoadingScreen: true
						}
					}],
				});
				return;
			}

			if (payload.action == 'request-camera-permission') {
				await requestCameraPermission();

				return;
			}

			if (payload.action == 'open-app-settings') {
				openAppSettings();
				
				return;
			}
		}
		
		catch (e) {
			Gateway.Exception('Batapp::handleOnMessage', e.message, 'ERROR - Could not parse post webview message');
		}
	};

	const renderLoading = () => {
		const url = new URL(initialUrl);
	
		if (url.pathname === "/" || url.pathname === "") {
			return <Loader.HomeLoader />;
		}
	
		if (url.pathname.includes('/profile/view') || url.pathname.includes('/profile/manage')) {
			return <Loader.ProfileLoader />;
		}
	
		return <Loader.DefaultLoader />;
	};

	const handleWebViewError = (syntheticEvent) => {		
		const { nativeEvent } = syntheticEvent;

		Gateway.Exception('Batapp::handleWebViewError', 'Webview OnError' , 'ERROR - Unable to load webview', nativeEvent);
		setError(true);
	};

	if (error) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorTextTitle}>Unable to load the page</Text>
				<Text style={styles.errorTextMessage}>Please ensure you're connected to the internet and try again.</Text>
			</View>
		);
	}

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.container}>
				<StatusBar
					barStyle="light-content"
					backgroundColor="#00000"
					translucent={true}
				/>
				<WebView
					ref={webViewRef}
					source={{ uri: initialUrl }}
					style={styles.webview}
					startInLoadingState={true}
					javaScriptEnabled={true}
					domStorageEnabled={true}
					allowFileAccess={true}
					allowContentAccess={true}
					onNavigationStateChange={handleNavigationChange}
					onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
					onLoad={handleOnLoad}
					onError={handleWebViewError}
					decelerationRate="normal"
					contentInsetAdjustmentBehavior="automatic"
					showsVerticalScrollIndicator={false}
					overScrollMode="never"
					bounces={false}
					preferredContentMode="mobile"
					mediaPlaybackRequiresUserAction={false}
        			allowsInlineMediaPlayback={true}
					onMessage={handleOnMessage}
					renderLoading={renderLoading}
				/>
			</SafeAreaView>
		</SafeAreaProvider>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#00000',
	},
	webview: {
		flex: 1,
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#00000',
		paddingHorizontal: 30,
	},
	errorTextTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: 10,
		textAlign: 'center',
	},
	errorTextMessage: {
		fontSize: 16,
		color: '#f8f8f2',
		textAlign: 'center',
		lineHeight: 24,
	}
});

export default Batapp;