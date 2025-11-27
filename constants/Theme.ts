import { Colors } from './Colors';

export const Theme = {
    light: {
        colors: Colors.light,
        spacing: {
            xs: 4,
            s: 8,
            m: 16,
            l: 24,
            xl: 32,
        },
        borderRadius: {
            s: 4,
            m: 8,
            l: 12,
            xl: 16,
            round: 9999,
        },
        typography: {
            h1: { fontSize: 32, fontWeight: '700' },
            h2: { fontSize: 24, fontWeight: '600' },
            h3: { fontSize: 20, fontWeight: '600' },
            body: { fontSize: 16, fontWeight: '400' },
            caption: { fontSize: 12, fontWeight: '400' },
        },
    },
    dark: {
        colors: Colors.dark,
        spacing: {
            xs: 4,
            s: 8,
            m: 16,
            l: 24,
            xl: 32,
        },
        borderRadius: {
            s: 4,
            m: 8,
            l: 12,
            xl: 16,
            round: 9999,
        },
        typography: {
            h1: { fontSize: 32, fontWeight: '700' },
            h2: { fontSize: 24, fontWeight: '600' },
            h3: { fontSize: 20, fontWeight: '600' },
            body: { fontSize: 16, fontWeight: '400' },
            caption: { fontSize: 12, fontWeight: '400' },
        },
    },
};
