import React, { useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    Animated,
    Dimensions,
    StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
    // Animated values for fade in/out effects
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);
    const iconAnim = new Animated.Value(0);
    const textAnim = new Animated.Value(0);

    useEffect(() => {
        // Start animations when component mounts
        Animated.sequence([
            // Fade and scale in
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 7,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]),
            // Animate icon
            Animated.spring(iconAnim, {
                toValue: 1,
                friction: 6,
                tension: 20,
                useNativeDriver: true,
            }),
            // Animate text
            Animated.timing(textAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            // Wait for 2 seconds
            Animated.delay(1500),
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Animation is complete
            setTimeout(() => onFinish(), 200);
        });
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <LinearGradient
                colors={['#4CAF50', '#8BC34A', '#CDDC39']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            {
                                transform: [
                                    {
                                        translateY: iconAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [20, 0]
                                        })
                                    },
                                    {
                                        scale: iconAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.8, 1]
                                        })
                                    }
                                ]
                            }
                        ]}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="nutrition" size={80} color="#FFFFFF" />
                        </View>
                    </Animated.View>

                    <Animated.View
                        style={{
                            opacity: textAnim,
                            transform: [
                                {
                                    translateY: textAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0]
                                    })
                                }
                            ]
                        }}
                    >
                        <Text style={styles.title}>Alimbeby</Text>
                        <Text style={styles.subtitle}>Gerenciamento de alimentação do bebê</Text>
                    </Animated.View>
                </Animated.View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        width: width * 0.9,
    },
    logoContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    title: {
        fontSize: 46,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    subtitle: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center',
        marginHorizontal: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
});

export default SplashScreen;
