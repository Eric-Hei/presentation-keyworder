import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useKeyword } from '../../context/KeywordContext';
import { Theme } from '../../constants/Theme';
import { useColorScheme } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { KeywordListItem } from '../../components/KeywordListItem';
import { KeywordList } from '../../services/storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function KeywordListScreen() {
    const { lists, saveList, deleteList, setCurrentList } = useKeyword();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Theme.dark : Theme.light;
    const router = useRouter();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newListName, setNewListName] = useState('');

    const handleCreateList = async () => {
        if (!newListName.trim()) return;

        const newList: KeywordList = {
            id: Date.now().toString(),
            name: newListName.trim(),
            keywords: [],
            lastModified: Date.now(),
        };

        await saveList(newList);
        setNewListName('');
        setIsModalVisible(false);
        router.push({ pathname: '/(tabs)/edit-list', params: { listId: newList.id } });
    };

    const handlePressList = (list: KeywordList) => {
        setCurrentList(list);
        router.push({ pathname: '/(tabs)/edit-list', params: { listId: list.id } });
    };

    const handleDeleteList = (listId: string) => {
        Alert.alert(
            "Delete List",
            "Are you sure you want to delete this list?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteList(listId) }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Lists</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => setIsModalVisible(true)}
                >
                    <Plus color="white" size={24} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={lists}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <KeywordListItem
                        list={item}
                        onPress={handlePressList}
                        onDelete={handleDeleteList}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: theme.colors.gray }]}>
                            No lists yet. Create one to get started!
                        </Text>
                    </View>
                }
            />

            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>New List</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <X color={theme.colors.icon} size={24} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: theme.colors.text,
                                    backgroundColor: theme.colors.background,
                                    borderColor: theme.colors.grayLight
                                }
                            ]}
                            placeholder="List Name (e.g., Q1 Review)"
                            placeholderTextColor={theme.colors.gray}
                            value={newListName}
                            onChangeText={setNewListName}
                            autoFocus
                        />

                        <TouchableOpacity
                            style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleCreateList}
                        >
                            <Text style={styles.createButtonText}>Create List</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 24,
    },
    createButton: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
