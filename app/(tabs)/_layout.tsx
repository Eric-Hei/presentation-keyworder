import { Tabs } from 'expo-router';
import { Mic, List, Settings } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { Theme } from '../../constants/Theme';

import i18n from '../../services/i18n';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Theme.dark : Theme.light;

    return (
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.background,
                },
                headerTintColor: theme.colors.text,
                tabBarStyle: {
                    backgroundColor: theme.colors.background,
                    borderTopColor: theme.colors.grayLight,
                },
                tabBarActiveTintColor: theme.colors.tint,
                tabBarInactiveTintColor: theme.colors.tabIconDefault,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: i18n.t('tab_lists'),
                    tabBarIcon: ({ color }) => <List size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: i18n.t('tab_settings'),
                    tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
