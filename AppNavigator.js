import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { withIAPContext } from "react-native-iap";
import React, { createRef } from 'react';
import { StatusBar } from 'react-native';
import { Batapp, Page, Pricing } from './src/screens';

export const navigationRef = createRef();
const Stack = createStackNavigator();

function AppNavigator() {
	return (
		<NavigationContainer ref={navigationRef}>
			<StatusBar
				barStyle="light-content"
				backgroundColor="transparent"
				translucent={true}
			/>
			<Stack.Navigator initialRouteName="Batapp">
				<Stack.Screen 
					name="Batapp" 
					component={Batapp} 
					options={{ headerShown: false }} 
					initialParams={{ initialUrl: '' }}
				/>
				<Stack.Screen
					name="Page"
					component={Page}
					options={({ route }) => ({
						title: '',
						headerStyle: {
							backgroundColor: '#3a7247',
						},
						headerTintColor: '#fff',
						headerBackTitle: '',
						headerTitle: '',
					})}
				/>
				<Stack.Screen
					name="Pricing"
					component={withIAPContext(Pricing)}
					options={({ route }) => ({
						title: '',
						headerStyle: {
							backgroundColor: '#3a7247',
						},
						headerTintColor: '#fff',
						headerBackTitle: '',
						headerTitle: '',
					})}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}

export function Navigate(name, params) {
	if (navigationRef.current) {
		navigationRef.current.navigate(name, params);
	}
}

export default AppNavigator;