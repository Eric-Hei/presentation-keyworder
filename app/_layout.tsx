import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Theme } from '../constants/Theme';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { KeywordProvider } from '../context/KeywordContext';

import i18n, { initI18n } from '../services/i18n';
import { useEffect, useState } from 'react';

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Theme.dark : Theme.light;
    const [isI18nInitialized, setIsI18nInitialized] = useState(false);

    useEffect(() => {
        initI18n().then(() => setIsI18nInitialized(true));
    }, []);

    if (!isI18nInitialized) return null; // Or a loading spinner

    return (
        <ErrorBoundary>
            <KeywordProvider>
                <SafeAreaProvider>
                    <StatusBar style="auto" />
                    <Stack
                        screenOptions={{
                            headerStyle: {
                                backgroundColor: theme.colors.background,
                            },
                            headerTintColor: theme.colors.text,
                            headerTitleStyle: {
                                fontWeight: 'bold',
                            },
                            headerBackTitle: i18n.t('header_back'),
                            contentStyle: {
                                backgroundColor: theme.colors.background,
                            },
                        }}
                    >
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="edit-list" options={{ title: i18n.t('edit_title'), headerBackTitle: i18n.t('header_back') }} />
                        <Stack.Screen name="presentation" options={{ title: i18n.t('tab_lists'), headerBackTitle: i18n.t('header_back') }} />
                    </Stack>
                </SafeAreaProvider>
            </KeywordProvider>
        </ErrorBoundary>
    );
}
