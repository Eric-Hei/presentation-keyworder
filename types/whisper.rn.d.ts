declare module 'whisper.rn' {
    export interface WhisperContext {
        transcribeRealtime: (options: any) => {
            subscribe: (callback: (event: any) => void) => {
                unsubscribe: () => void;
            };
        };
        stop: () => Promise<void>;
    }

    export interface InitOptions {
        filePath: string;
    }

    export function initWhisper(options: InitOptions): Promise<WhisperContext>;
}
