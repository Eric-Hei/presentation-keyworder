import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeyword } from '../../context/KeywordContext';
import { Theme } from '../../constants/Theme';
import { useColorScheme } from 'react-native';
import { Plus, Trash2, Play, ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditListScreen() {
    const { listId } = useLocalSearchParams<{ listId: string }>();
    const { lists, saveList } = useKeyword();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Theme.dark : Theme.light;
    const router = useRouter();

    const [currentList, setCurrentList] = useState(lists.find(l => l.id === listId));
    const [newKeyword, setNewKeyword] = useState('');

    useEffect(() => {
        const list = lists.find(l => l.id === listId);
        if (list) {
            setCurrentList(list);
        }
    }, [listId, lists]);

    const handleAddKeyword = async () => {
        if (!newKeyword.trim() || !currentList) return;

        const keyword = {
            id: Date.now().toString(),
            text: newKeyword.trim(),
            checked: false,
        };

        const updatedList = {
            ...currentList,
            keywords: [...currentList.keywords, keyword],
            lastModified: Date.now(),
        };

        await saveList(updatedList);
        setNewKeyword('');
    };

    const handleDeleteKeyword = async (keywordId: string) => {
        if (!currentList) return;

        const updatedList = {
            ...currentList,
            keywords: currentList.keywords.filter(k => k.id !== keywordId),
            lastModified: Date.now(),
        };

        await saveList(updatedList);
    };

    const handleStartPresentation = () => {
        router.push({ pathname: '/(tabs)/presentation', params: { listId } });
    };

    if (!currentList) return null;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft color={theme.colors.text} size={24} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.colors.text }]}>{currentList.name}</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.content}>
                    <Text style={[styles.subtitle, { color: theme.colors.gray }]}>
                        Manage Keywords ({currentList.keywords.length})
                    </Text>

                    <FlatList
                        data={currentList.keywords}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View style={[styles.keywordItem, { backgroundColor: theme.colors.surface }]}>
                                <Text style={[styles.keywordText, { color: theme.colors.text }]}>{item.text}</Text>
                                <TouchableOpacity onPress={() => handleDeleteKeyword(item.id)}>
                                    <Trash2 size={20} color={theme.colors.danger} />
                                </TouchableOpacity>
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                        style={styles.list}
                    />

                    <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.grayLight }]}>
                        <TextInput
                            style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.background, borderColor: theme.colors.grayLight }]}
                            placeholder="Add a keyword..."
                            placeholderTextColor={theme.colors.gray}
                            value={newKeyword}
                            onChangeText={setNewKeyword}
                            onSubmitEditing={handleAddKeyword}
                            returnKeyType="done"
                        />
                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleAddKeyword}
                        >
                            <Plus color="white" size={24} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.footer, { borderTopColor: theme.colors.grayLight }]}>
                    <TouchableOpacity
                        style={[styles.startButton, { backgroundColor: theme.colors.success }]}
                        onPress={handleStartPresentation}
                    >
                        <Play color="white" size={24} style={{ marginRight: 8 }} />
                        <Text style={styles.startButtonText}>Start Presentation</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    subtitle: {
        fontSize: 14,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 20,
        gap: 12,
    },
    keywordItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    keywordText: {
        fontSize: 16,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    addButton: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    startButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    startButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
