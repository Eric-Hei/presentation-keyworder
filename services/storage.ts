import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Keyword {
    id: string;
    text: string;
    checked: boolean;
}

export interface KeywordList {
    id: string;
    name: string;
    keywords: Keyword[];
    lastModified: number;
}

const STORAGE_KEYS = {
    LISTS: 'presentation-keyworder:lists',
    SETTINGS: 'presentation-keyworder:settings',
};

export const StorageService = {
    async getLists(): Promise<KeywordList[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.LISTS);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Failed to load lists', e);
            return [];
        }
    },

    async saveLists(lists: KeywordList[]): Promise<void> {
        try {
            const jsonValue = JSON.stringify(lists);
            await AsyncStorage.setItem(STORAGE_KEYS.LISTS, jsonValue);
        } catch (e) {
            console.error('Failed to save lists', e);
        }
    },

    async saveList(list: KeywordList): Promise<void> {
        const lists = await this.getLists();
        const index = lists.findIndex((l) => l.id === list.id);

        if (index >= 0) {
            lists[index] = list;
        } else {
            lists.push(list);
        }

        await this.saveLists(lists);
    },

    async deleteList(listId: string): Promise<void> {
        const lists = await this.getLists();
        const newLists = lists.filter((l) => l.id !== listId);
        await this.saveLists(newLists);
    },
};
