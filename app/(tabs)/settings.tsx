import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Theme } from '../../constants/Theme';
import { useColorScheme } from 'react-native';
import { StorageService, WhisperModel, AppLanguage } from '../../services/storage';
import { audioService } from '../../services/audio';
import { Check, Download, Server, Eye, EyeOff, Globe } from 'lucide-react-native';
import { Switch } from 'react-native';
import i18n, { setAppLanguage } from '../../services/i18n';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Theme.dark : Theme.light;
    const [currentModel, setCurrentModel] = useState<WhisperModel>('tiny');
    const [showTranscription, setShowTranscription] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>('system');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const settings = await StorageService.getSettings();
        setCurrentModel(settings.whisperModel);
        setShowTranscription(settings.showTranscription);
        setCurrentLanguage(settings.language);
    };

    const handleLanguageChange = async (lang: AppLanguage) => {
        setCurrentLanguage(lang);
        await setAppLanguage(lang);
        const settings = await StorageService.getSettings();
        await StorageService.saveSettings({ ...settings, language: lang });
        // Force re-render is handled by state update, but i18n changes might need a reload or context.
        // For simplicity, we rely on React state update to re-render the component with new strings.
        // However, other components won't update until they re-render.
        // A full app reload is often best for language changes, but let's try dynamic update.
    };

    const toggleTranscription = async (value: boolean) => {
        setShowTranscription(value);
        const settings = await StorageService.getSettings();
        await StorageService.saveSettings({ ...settings, showTranscription: value });
    };

    const handleModelSelect = async (model: WhisperModel) => {
        if (model === currentModel) return;

        Alert.alert(
            i18n.t('settings_switch_title'),
            i18n.t('settings_switch_msg', { model: model.toUpperCase() }),
            [
                { text: i18n.t('home_cancel'), style: "cancel" },
                {
                    text: i18n.t('settings_switch_btn'),
                    onPress: async () => {
                        try {
                            setLoading(true);
                            // Save setting
                            await StorageService.saveSettings({ whisperModel: model, showTranscription, language: currentLanguage });
                            setCurrentModel(model);

                            // Reload audio service with new model
                            await audioService.reloadModel();
                            Alert.alert(i18n.t('settings_success_title'), i18n.t('settings_success_msg', { model }));
                        } catch (error) {
                            console.error('Failed to switch model:', error);
                            Alert.alert(i18n.t('settings_error_title'), i18n.t('settings_error_msg'));
                            // Revert setting
                            await StorageService.saveSettings({ whisperModel: currentModel, showTranscription, language: currentLanguage });
                            setCurrentModel(currentModel);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const ModelOption = ({ model, label, description, size }: { model: WhisperModel, label: string, description: string, size: string }) => (
        <TouchableOpacity
            style={[
                styles.optionCard,
                {
                    backgroundColor: theme.colors.surface,
                    borderColor: currentModel === model ? theme.colors.primary : 'transparent',
                    borderWidth: 2
                }
            ]}
            onPress={() => handleModelSelect(model)}
            disabled={loading}
        >
            <View style={styles.optionHeader}>
                <View style={styles.optionTitleContainer}>
                    <Server size={20} color={theme.colors.text} />
                    <Text style={[styles.optionTitle, { color: theme.colors.text }]}>{label}</Text>
                </View>
                {currentModel === model && <Check size={20} color={theme.colors.primary} />}
            </View>
            <Text style={[styles.optionDescription, { color: theme.colors.gray }]}>{description}</Text>
            <View style={styles.optionFooter}>
                <Download size={14} color={theme.colors.gray} />
                <Text style={[styles.optionSize, { color: theme.colors.gray }]}>{size}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{i18n.t('settings_title')}</Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.gray }]}>{i18n.t('settings_language')}</Text>
                <Text style={[styles.sectionDescription, { color: theme.colors.gray }]}>
                    {i18n.t('settings_language_desc')}
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {(['system', 'en', 'fr'] as AppLanguage[]).map((lang) => (
                        <TouchableOpacity
                            key={lang}
                            style={[
                                styles.langButton,
                                {
                                    backgroundColor: currentLanguage === lang ? theme.colors.primary : theme.colors.surface,
                                    borderColor: currentLanguage === lang ? theme.colors.primary : 'transparent',
                                    borderWidth: 1
                                }
                            ]}
                            onPress={() => handleLanguageChange(lang)}
                        >
                            <Text style={{ color: currentLanguage === lang ? 'white' : theme.colors.text, fontWeight: '600' }}>
                                {lang === 'system' ? 'System' : lang.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.gray }]}>{i18n.t('settings_model_title')}</Text>
                <Text style={[styles.sectionDescription, { color: theme.colors.gray }]}>
                    {i18n.t('settings_model_desc')}
                </Text>

                <ModelOption
                    model="tiny"
                    label={i18n.t('settings_model_tiny')}
                    description={i18n.t('settings_model_tiny_desc')}
                    size="~75 MB"
                />
                <ModelOption
                    model="base"
                    label={i18n.t('settings_model_base')}
                    description={i18n.t('settings_model_base_desc')}
                    size="~142 MB"
                />
                <ModelOption
                    model="small"
                    label={i18n.t('settings_model_small')}
                    description={i18n.t('settings_model_small_desc')}
                    size="~466 MB"
                />
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.gray }]}>{i18n.t('settings_perf_title')}</Text>
                <View style={[styles.optionCard, { backgroundColor: theme.colors.surface, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <View style={{ flex: 1, marginRight: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            {showTranscription ? <Eye size={20} color={theme.colors.text} /> : <EyeOff size={20} color={theme.colors.text} />}
                            <Text style={[styles.optionTitle, { color: theme.colors.text, marginLeft: 10, fontSize: 16 }]}>{i18n.t('settings_show_transcription')}</Text>
                        </View>
                        <Text style={[styles.optionDescription, { color: theme.colors.gray, marginBottom: 0 }]}>
                            {i18n.t('settings_show_transcription_desc')}
                        </Text>
                    </View>
                    <Switch
                        value={showTranscription}
                        onValueChange={toggleTranscription}
                        trackColor={{ false: theme.colors.grayLight, true: theme.colors.primary }}
                    />
                </View>
            </View>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.text }]}>{i18n.t('settings_switching')}</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
    },
    sectionDescription: {
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20,
    },
    optionCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    optionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    optionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    optionDescription: {
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    optionFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    optionSize: {
        fontSize: 12,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    langButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
    },
});
