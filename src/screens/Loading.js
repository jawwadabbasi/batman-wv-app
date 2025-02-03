import React from 'react';
import { View, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';

const { width, height } = Dimensions.get('window');

export const HomeLoader = () => {
    return (
        <View style={styles.homeContainer}>
            <ImageBackground
                source={require('../../assets/images/initialLoadingScreen.png')}
                style={styles.fullScreenImage}
                resizeMode="cover"
            />
        </View>
    );
};

export const ProfileLoader = () => {
    return (
        <View style={styles.profileContainer}>
            <ContentLoader 
                speed={0.8}
                width={width * 0.9}
                height={height * 0.9}
                backgroundColor="#f1f1f1"
                foregroundColor="#ffffff"
            >
            
                <Rect x="0" y={10 + height * 0.05 + 0} rx="4" ry="4" width="60%" height="20" /> 
                <Rect x="0" y={20 + height * 0.05 + 40} rx="4" ry="4" width="100%" height="40" /> 
                
                <Rect x="0" y={20 + height * 0.05 + 60} rx="4" ry="4" width="100%" height={height * 0.60} />

                <Circle cx={(width * 0.9) / 2} cy="250" r="60" />
                
                <Rect x="10" y={140 + height * 0.25 + 20} rx="4" ry="4" width="40%" height="15" /> 
                <Rect x="10" y={140 + height * 0.25 + 50} rx="4" ry="4" width="40%" height="15" /> 
                <Rect x="10" y={140 + height * 0.25 + 80} rx="4" ry="4" width="40%" height="15" />
                <Rect x="10" y={140 + height * 0.25 + 110} rx="4" ry="4" width="40%" height="15" /> 
                <Rect x="10" y={140 + height * 0.25 + 140} rx="4" ry="4" width="40%" height="15" /> 
                <Rect x="10" y={140 + height * 0.25 + 170} rx="4" ry="4" width="40%" height="15" /> 

                <Rect x="55%" y={140 + height * 0.25 + 20} rx="4" ry="4" width="40%" height="15" /> 
                <Rect x="55%" y={140 + height * 0.25 + 50} rx="4" ry="4" width="40%" height="15" /> 
                <Rect x="55%" y={140 + height * 0.25 + 80} rx="4" ry="4" width="40%" height="15" />
                <Rect x="55%" y={140 + height * 0.25 + 110} rx="4" ry="4" width="40%" height="15" /> 
                <Rect x="55%" y={140 + height * 0.25 + 140} rx="4" ry="4" width="40%" height="15" /> 
                <Rect x="55%" y={140 + height * 0.25 + 170} rx="4" ry="4" width="40%" height="15" /> 
            </ContentLoader>
        </View>
    );
};

export const DefaultLoader = () => {
    return (
        <View style={styles.defaultContainer}>
            <ContentLoader 
                speed={0.8}
                width={width * 0.9}
                height={height * 0.9}
                backgroundColor="#f1f1f1"
                foregroundColor="#ffffff"
            >

                <Rect x="0" y={10 + height * 0.05 + 40} rx="4" ry="4" width="100%" height={height * 0.60} />

            </ContentLoader>
        </View>
    );
};

export const PricingLoader = () => {
    return (
        <View style={styles.pricingContainer}>
            <ContentLoader 
                speed={0.8}
                width={width * 0.8}
                height={height * 0.8}
                backgroundColor="#f1f1f1"
                foregroundColor="#ffffff"
            >

                <Rect x="0" y={height * 0.01 + 20} rx="4" ry="4" width="100%" height={height * 0.60} />
            </ContentLoader>
        </View>
    );
};

const styles = StyleSheet.create({
    profileContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        width: '100%',
        backgroundColor: '#ffffff',
    },
    homeContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#74ac80',
    },
    defaultContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        width: '100%',
        backgroundColor: '#ffffff',
    },
    pricingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    fullScreenImage: {
        width: width,
        height: height,
    },
});