import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Theme } from '../../constants/Theme';
import { useColorScheme } from 'react-native';
import { StorageService, WhisperModel } from '../../services/storage';
import { audioService } from '../../services/audio';
import { Check, Download, Server } from 'lucide-react-native';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Theme.dark : Theme.light;
    const [currentModel, setCurrentModel] = useState<WhisperModel>('tiny');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const settings = await StorageService.getSettings();
        setCurrentModel(settings.whisperModel);
    };

    const handleModelSelect = async (model: WhisperModel) => {
        if (model === currentModel) return;

        Alert.alert(
            "Change Model",
            `Switch to ${model.toUpperCase()} model? This may require downloading a new model file.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Switch",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            // Save setting
                            await StorageService.saveSettings({ whisperModel: model });
                            setCurrentModel(model);

                            // Reload audio service with new model
                            await audioService.reloadModel();
                            Alert.alert("Success", `Switched to ${model} model successfully.`);
                        } catch (error) {
                            console.error('Failed to switch model:', error);
                            Alert.alert("Error", "Failed to switch model. Please check your internet connection.");
                            // Revert setting
                            await StorageService.saveSettings({ whisperModel: currentModel });
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
                <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.gray }]}>Speech Recognition Model</Text>
                <Text style={[styles.sectionDescription, { color: theme.colors.gray }]}>
                    Choose a model that balances speed and accuracy. Larger models are more accurate but slower and require more storage.
                </Text>

                <ModelOption
                    model="tiny"
                    label="Tiny (Default)"
                    description="Fastest, lowest memory usage. Good for simple keywords."
                    size="~75 MB"
                />
                <ModelOption
                    model="base"
                    label="Base"
                    description="Better accuracy, slightly slower. Recommended for most users."
                    size="~142 MB"
                />
                <ModelOption
                    model="small"
                    label="Small"
                    description="High accuracy, slower. Best for complex vocabulary."
                    size="~466 MB"
                />
            </View>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.text }]}>Switching model...</Text>
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
});
