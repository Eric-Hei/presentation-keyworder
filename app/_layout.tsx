import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Theme } from '../constants/Theme';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { KeywordProvider } from '../context/KeywordContext';

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Theme.dark : Theme.light;

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
                            contentStyle: {
                                backgroundColor: theme.colors.background,
                            },
                        }}
                    >
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack>
                </SafeAreaProvider>
            </KeywordProvider>
        </ErrorBoundary>
    );
}
