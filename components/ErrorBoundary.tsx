import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleShare = async () => {
        const { error, errorInfo } = this.state;
        const message = `Error: ${error?.message}\n\nStack: ${errorInfo?.componentStack}`;
        try {
            await Share.share({ message });
        } catch (e) {
            console.error(e);
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Something went wrong</Text>
                    <ScrollView style={styles.scrollView}>
                        <Text style={styles.errorText}>
                            {this.state.error?.toString()}
                        </Text>
                        <Text style={styles.stackText}>
                            {this.state.errorInfo?.componentStack}
                        </Text>
                    </ScrollView>
                    <TouchableOpacity style={styles.button} onPress={this.handleShare}>
                        <Text style={styles.buttonText}>Share Error Log</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#d32f2f',
    },
    scrollView: {
        flex: 1,
        width: '100%',
        marginBottom: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    stackText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Courier',
    },
    button: {
        backgroundColor: '#2196f3',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
