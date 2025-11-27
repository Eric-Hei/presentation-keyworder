import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService, KeywordList } from '../services/storage';

interface KeywordContextType {
    lists: KeywordList[];
    currentList: KeywordList | null;
    loadLists: () => Promise<void>;
    saveList: (list: KeywordList) => Promise<void>;
    deleteList: (listId: string) => Promise<void>;
    setCurrentList: (list: KeywordList | null) => void;
}

const KeywordContext = createContext<KeywordContextType | undefined>(undefined);

export function KeywordProvider({ children }: { children: React.ReactNode }) {
    const [lists, setLists] = useState<KeywordList[]>([]);
    const [currentList, setCurrentList] = useState<KeywordList | null>(null);

    const loadLists = async () => {
        const loadedLists = await StorageService.getLists();
        setLists(loadedLists);
    };

    const saveList = async (list: KeywordList) => {
        await StorageService.saveList(list);
        await loadLists();
    };

    const deleteList = async (listId: string) => {
        await StorageService.deleteList(listId);
        await loadLists();
    };

    useEffect(() => {
        loadLists();
    }, []);

    return (
        <KeywordContext.Provider
            value={{
                lists,
                currentList,
                loadLists,
                saveList,
                deleteList,
                setCurrentList,
            }}
        >
            {children}
        </KeywordContext.Provider>
    );
}

export function useKeyword() {
    const context = useContext(KeywordContext);
    if (context === undefined) {
        throw new Error('useKeyword must be used within a KeywordProvider');
    }
    return context;
}
