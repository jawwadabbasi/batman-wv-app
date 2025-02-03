# batman-wv-app

## Overview
**batman-wv-app** is a React Native Expo-based application that wraps a WebView to provide a seamless mobile experience. This application enhances the WebView functionality with key native integrations, including push notifications, in-app purchases, and performance optimizations.

## Features

### 📱 WebView Wrapper
- Utilizes **React Native WebView** to provide a smooth and secure browsing experience within the app.
- Injects JavaScript for additional customization and interaction with the WebView content.

### 🔔 Notifications
- Integrated with **Expo Notifications** to receive and manage push notifications.
- Ensures real-time updates and alerts for users.

### 💳 In-App Purchases & Subscriptions
- Implements **React Native IAP** for handling **in-app purchases** and **subscriptions**.
- Supports **both iOS and Android billing systems**.
- Offers **one-time purchases** and **recurring subscriptions**.

### ⏳ Skeleton Page Loader
- Uses a **custom skeleton loader** to improve the user experience while WebView content loads.
- Provides a smooth transition between pages.

### ⚡ JavaScript Injection
- Injects JavaScript into the WebView to enhance user interactions.
- Allows for **custom event handling, UI adjustments, and debugging enhancements**.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/batman-wv-app.git
   cd batman-wv-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   expo start
   ```

## Configuration
- **Push Notifications**: Ensure that Expo's push notification service is configured with your FCM (Firebase Cloud Messaging) credentials.
- **In-App Purchases**: Set up your Apple App Store and Google Play Console IAP configurations and update `react-native-iap` accordingly.
- **JavaScript Injection**: Modify `injectedJavaScript` in the WebView component to customize scripts as needed.

## Usage
- Launch the app to access the WebView.
- Receive notifications when relevant events occur.
- Purchase subscriptions or in-app items seamlessly through the integrated payment system.
- Enjoy a smooth browsing experience with built-in optimizations.

## Technologies Used
- **React Native** (Expo framework)
- **WebView** (`react-native-webview`)
- **Push Notifications** (`expo-notifications`)
- **In-App Purchases** (`react-native-iap`)
- **JavaScript Injection** (WebView custom scripts)

## The Dark Knight's Final Words 🦇

"This app isn’t just a WebView. It’s a guardian. A silent protector. A watchful presence... always keeping your browsing experience smooth and secure." 🚀