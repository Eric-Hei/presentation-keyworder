import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeyword } from '../../context/KeywordContext';
import { Theme } from '../../constants/Theme';
import { useColorScheme } from 'react-native';
import { audioService, TranscriptionResult } from '../../services/audio';
import { KeywordBubble } from '../../components/KeywordBubble';
import { Mic, MicOff, RotateCcw } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PresentationScreen() {
    const { listId } = useLocalSearchParams<{ listId: string }>();
    const { lists, saveList } = useKeyword();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Theme.dark : Theme.light;
    const router = useRouter();

    const [currentList, setCurrentList] = useState(lists.find(l => l.id === listId));
    const [isListening, setIsListening] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    // Keep track of matched keywords to avoid re-matching
    const matchedKeywordIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        const list = lists.find(l => l.id === listId);
        if (list) {
            // Reset all keywords to unchecked when entering presentation mode
            const resetKeywords = list.keywords.map(k => ({ ...k, checked: false }));
            const resetList = { ...list, keywords: resetKeywords };
            setCurrentList(resetList);
            saveList(resetList);

            // Clear matched keywords tracking and completion state
            matchedKeywordIds.current.clear();
            setIsComplete(false);
        }
    }, [listId]);

    useEffect(() => {
        audioService.initialize();

        const unsubscribe = audioService.addListener((result: TranscriptionResult) => {
            console.log('[PresentationScreen] Received transcription:', result.text);
            setTranscribedText(result.text);
            checkKeywords(result.text);
        });

        // Auto-start listening when entering presentation mode
        const startRecording = async () => {
            try {
                console.log('[PresentationScreen] Auto-starting microphone...');
                await audioService.startListening();
                setIsListening(true);
            } catch (error) {
                console.error('[PresentationScreen] Failed to auto-start:', error);
            }
        };
        startRecording();

        return () => {
            unsubscribe();
            audioService.stopListening();
        };
    }, []);

    const checkKeywords = (text: string) => {
        if (!currentList) return;

        const lowerText = text.toLowerCase();
        console.log('[PresentationScreen] Checking keywords in text:', lowerText);

        let hasChanges = false;
        const updatedKeywords = currentList.keywords.map(k => {
            // CRITICAL: Always ensure matched keywords stay checked
            if (matchedKeywordIds.current.has(k.id)) {
                return { ...k, checked: true };
            }

            const lowerKeyword = k.text.toLowerCase();
            console.log('[PresentationScreen] Testing keyword:', lowerKeyword);

            // Normalize text: remove punctuation and extra spaces
            const normalizedText = lowerText.replace(/[.,;:!?\-"']/g, ' ').replace(/\s+/g, ' ');
            const normalizedKeyword = lowerKeyword.replace(/[.,;:!?\-"']/g, ' ').replace(/\s+/g, ' ');

            // Split into words and check if keyword is present as a complete word or phrase
            const words = normalizedText.split(' ');
            const keywordWords = normalizedKeyword.split(' ');

            // Check if the keyword phrase appears in the text
            let found = false;
            if (keywordWords.length === 1) {
                // Single word: just check if it's in the word list
                found = words.includes(keywordWords[0]);
            } else {
                // Multi-word phrase: check for consecutive occurrence
                const keywordPhrase = keywordWords.join(' ');
                found = normalizedText.includes(keywordPhrase);
            }

            if (found) {
                console.log('[PresentationScreen] ✓ Keyword matched:', k.text);
                matchedKeywordIds.current.add(k.id);
                hasChanges = true;
                return { ...k, checked: true };
            }
            return k;
        });

        if (hasChanges) {
            const updatedList = { ...currentList, keywords: updatedKeywords };
            setCurrentList(updatedList);
            saveList(updatedList);

            // Check if all keywords are now matched
            const allMatched = updatedKeywords.every(k => k.checked);
            if (allMatched && !isComplete) {
                console.log('[PresentationScreen] 🎉 All keywords completed!');
                setIsComplete(true);

                // Stop listening
                setTimeout(async () => {
                    try {
                        await audioService.stopListening();
                        setIsListening(false);
                    } catch (error) {
                        console.error('[PresentationScreen] Error stopping after completion:', error);
                    }
                }, 1000); // Wait 1 second to show the message
            }
        }
    };

    const toggleListening = async () => {
        console.log('toggleListening called, current state:', isListening);

        if (isListening) {
            try {
                console.log('Stopping listening...');
                await audioService.stopListening();
                setIsListening(false);
                console.log('Stopped successfully');
            } catch (error) {
                console.error('Error stopping:', error);
                Alert.alert('Error', `Failed to stop: ${error}`);
                setIsListening(false);
            }
        } else {
            try {
                console.log('Starting listening...');
                await audioService.startListening();
                setIsListening(true);
                console.log('Started successfully');
            } catch (error) {
                console.error('Error starting:', error);
                Alert.alert(
                    'Microphone Error',
                    `Failed to start speech recognition: ${error}\n\nPlease check:\n1. Microphone permission\n2. Whisper model downloaded\n3. Check console logs`
                );
                setIsListening(false);
            }
        }
    };

    const handleManualToggle = (keywordId: string) => {
        if (!currentList) return;

        const updatedKeywords = currentList.keywords.map(k => {
            if (k.id === keywordId) {
                const newChecked = !k.checked;
                if (newChecked) matchedKeywordIds.current.add(k.id);
                else matchedKeywordIds.current.delete(k.id);
                return { ...k, checked: newChecked };
            }
            return k;
        });

        const updatedList = { ...currentList, keywords: updatedKeywords };
        setCurrentList(updatedList);
        saveList(updatedList);
    };

    const handleReset = () => {
        Alert.alert(
            "Reset Session",
            "Are you sure you want to reset all keywords?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => {
                        if (!currentList) return;
                        const updatedKeywords = currentList.keywords.map(k => ({ ...k, checked: false }));
                        matchedKeywordIds.current.clear();
                        const updatedList = { ...currentList, keywords: updatedKeywords };
                        setCurrentList(updatedList);
                        saveList(updatedList);
                        setTranscribedText('');
                    }
                }
            ]
        );
    };

    if (!currentList) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.colors.text }}>List not found</Text>
            </View>
        );
    }

    const progress = currentList.keywords.length > 0
        ? Math.round((currentList.keywords.filter(k => k.checked).length / currentList.keywords.length) * 100)
        : 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: theme.colors.text }]}>{currentList.name}</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.gray }]}>
                        {progress}% Completed
                    </Text>
                </View>
                <View style={styles.controls}>
                    <TouchableOpacity onPress={handleReset} style={styles.iconButton}>
                        <RotateCcw size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.progressBarContainer}>
                <View
                    style={[
                        styles.progressBar,
                        {
                            backgroundColor: theme.colors.primary,
                            width: `${progress}%`
                        }
                    ]}
                />
            </View>

            <ScrollView contentContainerStyle={styles.keywordsContainer}>
                {isComplete ? (
                    <View style={styles.celebrationContainer}>
                        <Text style={[styles.celebrationEmoji]}>🎉</Text>
                        <Text style={[styles.celebrationText, { color: theme.colors.primary }]}>
                            Bravo !
                        </Text>
                        <Text style={[styles.celebrationSubtext, { color: theme.colors.text }]}>
                            Tout est dit !
                        </Text>
                    </View>
                ) : (
                    <View style={styles.keywordsGrid}>
                        {currentList.keywords.map(keyword => (
                            <KeywordBubble
                                key={keyword.id}
                                text={keyword.text}
                                checked={keyword.checked}
                                onPress={() => handleManualToggle(keyword.id)}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.colors.grayLight }]}>
                <Text style={[styles.transcription, { color: theme.colors.gray }]}>
                    {transcribedText || (isListening ? "Listening..." : "Tap mic to start")}
                </Text>
                <TouchableOpacity
                    style={[
                        styles.micButton,
                        { backgroundColor: isListening ? theme.colors.danger : theme.colors.primary }
                    ]}
                    onPress={toggleListening}
                >
                    {isListening ? <MicOff color="white" size={32} /> : <Mic color="white" size={32} />}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    controls: {
        flexDirection: 'row',
        gap: 16,
    },
    iconButton: {
        padding: 8,
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: '#E5E5EA',
        marginHorizontal: 20,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
    },
    keywordsContainer: {
        padding: 20,
    },
    keywordsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    celebrationContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    celebrationEmoji: {
        fontSize: 120,
        marginBottom: 24,
    },
    celebrationText: {
        fontSize: 56,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    celebrationSubtext: {
        fontSize: 36,
        fontWeight: '600',
        textAlign: 'center',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        alignItems: 'center',
    },
    transcription: {
        marginBottom: 20,
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        height: 40,
    },
    micButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
});
