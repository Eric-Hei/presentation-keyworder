import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { KeywordList } from '../services/storage';
import { Theme } from '../constants/Theme';
import { ChevronRight, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'react-native';

interface KeywordListItemProps {
    list: KeywordList;
    onPress: (list: KeywordList) => void;
    onDelete: (listId: string) => void;
}

export function KeywordListItem({ list, onPress, onDelete }: KeywordListItemProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Theme.dark : Theme.light;

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.colors.surface }]}
            onPress={() => onPress(list)}
        >
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{list.name}</Text>
                <Text style={[styles.subtitle, { color: theme.colors.icon }]}>
                    {list.keywords.length} keywords
                </Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => onDelete(list.id)} style={styles.deleteButton}>
                    <Trash2 size={20} color={theme.colors.danger} />
                </TouchableOpacity>
                <ChevronRight size={20} color={theme.colors.gray} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    deleteButton: {
        padding: 8,
    },
});
