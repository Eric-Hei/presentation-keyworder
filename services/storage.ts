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

export type WhisperModel = 'tiny' | 'base' | 'small';

export interface AppSettings {
    whisperModel: WhisperModel;
}

const DEFAULT_SETTINGS: AppSettings = {
    whisperModel: 'tiny',
};

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

    async getSettings(): Promise<AppSettings> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
            return jsonValue != null ? { ...DEFAULT_SETTINGS, ...JSON.parse(jsonValue) } : DEFAULT_SETTINGS;
        } catch (e) {
            console.error('Failed to load settings', e);
            return DEFAULT_SETTINGS;
        }
    },

    async saveSettings(settings: AppSettings): Promise<void> {
        try {
            const jsonValue = JSON.stringify(settings);
            await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, jsonValue);
        } catch (e) {
            console.error('Failed to save settings', e);
        }
    },
};
