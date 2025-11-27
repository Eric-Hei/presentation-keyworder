import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Theme } from '../constants/Theme';
import { useColorScheme } from 'react-native';
import { Check } from 'lucide-react-native';
import { useEffect, useRef } from 'react';

interface KeywordBubbleProps {
    text: string;
    checked: boolean;
    onPress: () => void;
}

export function KeywordBubble({ text, checked, onPress }: KeywordBubbleProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Theme.dark : Theme.light;

    // Animation values
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (checked) {
            // Fade out and scale down animation, then completely disappear
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Reset animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [checked]);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Animated.View
                style={[
                    styles.container,
                    {
                        backgroundColor: checked ? theme.colors.success : theme.colors.surface,
                        borderColor: checked ? theme.colors.success : theme.colors.grayLight,
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    }
                ]}
            >
                <Text
                    style={[
                        styles.text,
                        {
                            color: checked ? 'white' : theme.colors.text,
                            fontWeight: checked ? 'bold' : '600'
                        }
                    ]}
                >
                    {text}
                </Text>
                {checked && <Check size={24} color="white" style={styles.icon} />}
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderRadius: 32,
        borderWidth: 2,
        margin: 8,
        minWidth: 120,
    },
    text: {
        fontSize: 32,
        letterSpacing: 0.5,
    },
    icon: {
        marginLeft: 12,
    },
});
