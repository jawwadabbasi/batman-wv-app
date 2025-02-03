import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking, Platform, TouchableOpacity, Modal } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { registerForPushNotifications, handleTrackingPermissions } from './src/utility';
import AppNavigator, { Navigate } from './AppNavigator';
import { Settings } from 'react-native-fbsdk-next';
import * as Notifications from 'expo-notifications';
import * as ScreenCapture from 'expo-screen-capture';
import * as Updates from 'expo-updates';
import * as Application from 'expo-application';
import * as Gateway from './src/services/Gateway';

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

const App = () => {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isConnected, setIsConnected] = useState(true);
	const [isUpdateRequired, setIsUpdateRequired] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const lastNotificationResponse = Notifications.useLastNotificationResponse();

	useEffect(() => {
		const initializeApp = async () => {

			Settings.initializeSDK();
			await registerForPushNotifications();
			await handleTrackingPermissions();

			if (Platform.OS == 'android') {
				await ScreenCapture.preventScreenCaptureAsync();
			}

			Gateway.UpdateAppMeta();
			setIsInitialized(true);
		};

		initializeApp();

	}, []);

	useEffect(() => {
		checkAppVersion();

	}, []);

	useEffect(() => {
		if (isInitialized && lastNotificationResponse && lastNotificationResponse.notification.request.content.data.baseUrl) {
			Navigate('Batapp', { initialUrl: lastNotificationResponse.notification.request.content.data.baseUrl });
		}

		if (isInitialized && lastNotificationResponse && lastNotificationResponse.notification.request.content.data.pageUrl) {
			Navigate('Batapp', { notificationUrl: lastNotificationResponse.notification.request.content.data.pageUrl });
		}

	}, [isInitialized, lastNotificationResponse]);

	useEffect(() => {
		const checkForUpdates = async () => {

			try {
				const update = await Updates.checkForUpdateAsync();

				if (update.isAvailable) {
					await Updates.fetchUpdateAsync();
					await Updates.reloadAsync();
				}
			} 
			
			catch (e) {
				Gateway.Exception("App::checkForUpdates", e.message);
			}
		};

		checkForUpdates();

	  }, []);

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(state => {
			setIsConnected(state.isConnected);
		});

		return () => unsubscribe();
		
	}, []);

	const checkAppVersion = async () => {
		const result = await Gateway.AppVersion(Application.nativeApplicationVersion);

		if (!result) {

			setShowUpdateModal(false);
			setIsUpdateRequired(false);
			return false;
		}

		if (result == 'latest') {

			setShowUpdateModal(false);
			setIsUpdateRequired(false);
			return false;
		}

		if (result == 'supported') {

			setShowUpdateModal(true);
			setIsUpdateRequired(false);
			return;
		}

		if (result == 'deprecated') {

			setIsUpdateRequired(true);
			setShowUpdateModal(false);
			return;
		}
	};

	const handleUpdate = () => {
		const storeUrl = Platform.select({
			ios: 'itms-apps://itunes.apple.com/app/',
			android: 'market://details?id=',
		});

		Linking.openURL(storeUrl);
	};

	const renderUpdateAvailableModal = () => {
		return (
			<Modal visible={showUpdateModal} transparent={false} animationType="slide">
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={styles.messageTitle}>Update Available</Text>
						<Text style={styles.message}>
							A new version of the app is available. We recommend updating the app for the best experience.
						</Text>
						<View style={styles.modalbuttonContainer}>
							<TouchableOpacity style={styles.modalActionButton} onPress={() => setShowUpdateModal(false)}>
								<Text style={styles.modalActionButtonText}>Later</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.modalActionButton} onPress={handleUpdate}>
								<Text style={styles.modalActionButtonText}>Update</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		);
	};

	if (isUpdateRequired) {
		return (
			<View style={styles.messageContainer}>
				<Text style={styles.messageTitle}>Update Required</Text>
				<Text style={styles.message}>
					Please update the app to continue using Batapp.
				</Text>
				<TouchableOpacity style={styles.actionButton} onPress={handleUpdate}>
					<Text style={styles.actionButtonText}>Update Now</Text>
				</TouchableOpacity>
			</View>
		);
	}

	if (!isConnected) {
		return (
			<View style={styles.messageContainer}>
				<Text style={styles.messageTitle}>No Internet Connection</Text>
				<Text style={styles.message}>
					It looks like you're offline. Please check your connection and try again.
				</Text>
				<TouchableOpacity style={styles.actionButton} onPress={() => {}}>
					<Text style={styles.actionButtonText}>Retry</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<AppNavigator />
			{renderUpdateAvailableModal()}
		</GestureHandlerRootView>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalContent: {
		backgroundColor: '#74ac80',
		padding: 20,
		borderRadius: 10,
		marginHorizontal: 20,
		alignItems: 'center',
	},
	modalbuttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
	},
	modalActionButtonText: {
		color: '#74ac80',
		fontSize: 16,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	modalActionButton: {
		backgroundColor: '#ffffff',
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
		marginHorizontal: 10,
		flex: 1,
		alignItems: 'center',
	},
	messageContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#74ac80',
		paddingHorizontal: 30,
	},
	messageTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#ffffff',
		marginBottom: 10,
		textAlign: 'center',
	},
	message: {
		fontSize: 16,
		color: '#f8f8f2',
		textAlign: 'center',
		lineHeight: 24,
		marginBottom: 20,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	actionButton: {
		backgroundColor: '#ffffff',
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
		alignItems: 'center',
	},
	actionButtonText: {
		color: '#74ac80',
		fontSize: 16,
		fontWeight: 'bold',
		textAlign: 'center',
	},
});

export default App;