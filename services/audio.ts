import { initWhisper } from 'whisper.rn';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';

export interface TranscriptionResult {
    text: string;
    isFinal: boolean;
}

class AudioService {
    private whisperContext: any = null;
    private isListening: boolean = false;
    private listeners: Array<(result: TranscriptionResult) => void> = [];
    private modelDownloaded: boolean = false;
    private permissionGranted: boolean = false;
    private currentSubscription: any = null; // Store subscription to allow stopping

    async requestPermissions(): Promise<boolean> {
        try {
            console.log('Requesting microphone permission...');
            const permissionResponse = await Audio.requestPermissionsAsync();

            if (permissionResponse.status === 'granted') {
                console.log('Microphone permission granted');
                this.permissionGranted = true;
                return true;
            } else {
                console.error('Microphone permission denied');
                this.permissionGranted = false;
                return false;
            }
        } catch (error) {
            console.error('Error requesting microphone permission:', error);
            this.permissionGranted = false;
            return false;
        }
    }

    async initialize() {
        if (this.whisperContext) {
            console.log('Whisper already initialized');
            return;
        }

        // Request microphone permission first
        if (!this.permissionGranted) {
            const granted = await this.requestPermissions();
            if (!granted) {
                throw new Error('Microphone permission required for speech recognition');
            }
        }

        try {
            console.log('Starting Whisper initialization...');
            const modelDir = `${(FileSystem as any).documentDirectory}models/`;
            const modelPath = `${modelDir}ggml-tiny.bin`;

            // Check if model directory exists
            const dirInfo = await FileSystem.getInfoAsync(modelDir);
            if (!dirInfo.exists) {
                console.log('Creating models directory...');
                await FileSystem.makeDirectoryAsync(modelDir, { intermediates: true });
            }

            // Check if model file exists
            const fileInfo = await FileSystem.getInfoAsync(modelPath);
            if (!fileInfo.exists) {
                console.log('Downloading Whisper model (multilingual, ~75MB)...');
                const modelUrl = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin';

                await FileSystem.downloadAsync(modelUrl, modelPath);
                console.log('Model downloaded successfully');
                this.modelDownloaded = true;
            } else {
                console.log('Model already exists');
                this.modelDownloaded = true;
            }

            // Initialize Whisper context
            this.whisperContext = await initWhisper({
                filePath: modelPath,
            });

            console.log('Whisper initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Whisper:', error);
            throw new Error(`Whisper initialization failed: ${error}`);
        }
    }

    async startListening() {
        console.log('[AudioService] startListening called');
        console.log('[AudioService] whisperContext exists:', !!this.whisperContext);
        console.log('[AudioService] isListening:', this.isListening);

        if (!this.whisperContext) {
            console.warn('[AudioService] Whisper not initialized, initializing now...');
            try {
                await this.initialize();
                console.log('[AudioService] Initialization complete');
            } catch (error) {
                console.error('[AudioService] Initialization failed:', error);
                throw new Error(`Whisper initialization failed: ${error}`);
            }
        }

        if (this.isListening) {
            console.warn('[AudioService] Already listening, ignoring request');
            return;
        }

        this.isListening = true;
        console.log('[AudioService] Starting real-time transcription...');

        try {
            const subscription = await this.whisperContext.transcribeRealtime({
                language: 'fr',
                maxLen: 1,
                realtimeAudioSec: 120, // Extended to 2 minutes
                realtimeAudioSliceSec: 25, // Process in 25-second chunks
                // Configure Audio Session for iOS explicitly
                audioSessionOnStartIos: {
                    category: 'PlayAndRecord',
                    options: ['MixWithOthers', 'AllowBluetooth'],
                    mode: 'Measurement',
                },
                onProgress: (cur: number) => {
                    console.log('[AudioService] Progress:', cur);
                },
            });

            console.log('[AudioService] transcribeRealtime returned, subscribing...');

            subscription.subscribe((event: any) => {
                console.log('[AudioService] Event received:', event);
                const { isCapturing, data } = event;

                if (data && data.result) {
                    console.log('[AudioService] Transcription result:', data.result);
                    this.notifyListeners({
                        text: data.result,
                        isFinal: !isCapturing
                    });
                }

                if (!isCapturing) {
                    console.log('[AudioService] Capture stopped');
                    this.isListening = false;
                }
            });

            // Store subscription for later stopping
            this.currentSubscription = subscription;

            console.log('[AudioService] Subscribed successfully, listening started');
        } catch (error) {
            console.error('[AudioService] Error starting listening:', error);
            console.error('[AudioService] Error details:', JSON.stringify(error));
            this.isListening = false;
            throw error;
        }
    }

    async stopListening() {
        if (!this.isListening) {
            console.log('[AudioService] Already stopped, ignoring');
            return;
        }

        try {
            console.log('[AudioService] Stopping listening...');
            if (this.currentSubscription) {
                await this.currentSubscription.stop();
                this.currentSubscription = null;
                console.log('[AudioService] Subscription stopped');
            }
            this.isListening = false;
            console.log('[AudioService] Listening stopped successfully');
        } catch (error) {
            console.error('[AudioService] Error stopping listening:', error);
            this.isListening = false;
        }
    }

    addListener(callback: (result: TranscriptionResult) => void): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notifyListeners(result: TranscriptionResult) {
        this.listeners.forEach(listener => listener(result));
    }

    isModelDownloaded(): boolean {
        return this.modelDownloaded;
    }
}

export const audioService = new AudioService();
