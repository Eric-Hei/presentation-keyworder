import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { StorageService, AppLanguage } from './storage';

const translations = {
    en: {
        // Tabs
        tab_lists: 'My Lists',
        tab_settings: 'Settings',
        header_back: 'Back',

        // Home (Lists)
        home_title: 'My Lists',
        home_empty: 'No lists yet. Create one to get started!',
        home_new_list_title: 'New List',
        home_new_list_placeholder: 'List Name (e.g., Q1 Review)',
        home_create_btn: 'Create List',
        home_delete_title: 'Delete List',
        home_delete_msg: 'Are you sure you want to delete this list?',
        home_cancel: 'Cancel',
        home_delete: 'Delete',

        // Edit List
        edit_title: 'Manage Keywords',
        edit_subtitle: 'Manage Keywords (%{count})',
        edit_placeholder: 'Add a keyword...',
        edit_start_btn: 'Start Presentation',

        // Presentation
        pres_completed: '%{percent}% Completed',
        pres_bravo: 'Bravo !',
        pres_all_said: 'All said !',
        pres_listening: 'Listening...',
        pres_listening_hidden: 'Listening (Hidden)...',
        pres_tap_to_start: 'Tap mic to start',
        pres_reset_title: 'Reset Session',
        pres_reset_msg: 'Are you sure you want to reset all keywords?',
        pres_reset_btn: 'Reset',
        pres_error_mic: 'Microphone Error',
        pres_error_mic_msg: 'Failed to start speech recognition: %{error}',

        // Settings
        settings_title: 'Settings',
        settings_language: 'Language',
        settings_language_desc: 'Choose your preferred language',
        settings_perf_title: 'Performance & Debug',
        settings_show_transcription: 'Show Transcription',
        settings_show_transcription_desc: 'Display real-time text on screen and logs. Disable for better performance.',
        settings_model_title: 'Speech Recognition Model',
        settings_model_desc: 'Choose a model that balances speed and accuracy. Larger models are more accurate but slower and require more storage.',
        settings_model_tiny: 'Tiny (Default)',
        settings_model_tiny_desc: 'Fastest, lowest memory usage. Good for simple keywords.',
        settings_model_base: 'Base',
        settings_model_base_desc: 'Better accuracy, slightly slower. Recommended for most users.',
        settings_model_small: 'Small',
        settings_model_small_desc: 'High accuracy, slower. Best for complex vocabulary.',
        settings_switching: 'Switching model...',
        settings_switch_title: 'Change Model',
        settings_switch_msg: 'Switch to %{model} model? This may require downloading a new model file.',
        settings_switch_btn: 'Switch',
        settings_success_title: 'Success',
        settings_success_msg: 'Switched to %{model} model successfully.',
        settings_error_title: 'Error',
        settings_error_msg: 'Failed to switch model. Please check your internet connection.',
    },
    fr: {
        // Tabs
        tab_lists: 'Mes Listes',
        tab_settings: 'Réglages',
        header_back: 'Retour',

        // Home (Lists)
        home_title: 'Mes Listes',
        home_empty: 'Aucune liste. Créez-en une pour commencer !',
        home_new_list_title: 'Nouvelle Liste',
        home_new_list_placeholder: 'Nom de la liste (ex: Bilan Q1)',
        home_create_btn: 'Créer la liste',
        home_delete_title: 'Supprimer la liste',
        home_delete_msg: 'Voulez-vous vraiment supprimer cette liste ?',
        home_cancel: 'Annuler',
        home_delete: 'Supprimer',

        // Edit List
        edit_title: 'Gérer les mots-clés',
        edit_subtitle: 'Mots-clés (%{count})',
        edit_placeholder: 'Ajouter un mot-clé...',
        edit_start_btn: 'Lancer la présentation',

        // Presentation
        pres_completed: '%{percent}% Complété',
        pres_bravo: 'Bravo !',
        pres_all_said: 'Tout est dit !',
        pres_listening: 'Écoute en cours...',
        pres_listening_hidden: 'Écoute (Masquée)...',
        pres_tap_to_start: 'Appuyez pour parler',
        pres_reset_title: 'Réinitialiser',
        pres_reset_msg: 'Voulez-vous réinitialiser tous les mots-clés ?',
        pres_reset_btn: 'Réinitialiser',
        pres_error_mic: 'Erreur Micro',
        pres_error_mic_msg: 'Impossible de lancer la reconnaissance : %{error}',

        // Settings
        settings_title: 'Réglages',
        settings_language: 'Langue',
        settings_language_desc: 'Choisissez votre langue préférée',
        settings_perf_title: 'Performance & Debug',
        settings_show_transcription: 'Afficher la transcription',
        settings_show_transcription_desc: 'Affiche le texte en temps réel. Désactiver pour de meilleures performances.',
        settings_model_title: 'Modèle de reconnaissance',
        settings_model_desc: 'Choisissez un équilibre entre vitesse et précision. Les grands modèles sont plus précis mais plus lents.',
        settings_model_tiny: 'Tiny (Défaut)',
        settings_model_tiny_desc: 'Le plus rapide. Bien pour des mots simples.',
        settings_model_base: 'Base',
        settings_model_base_desc: 'Meilleure précision. Recommandé pour la plupart.',
        settings_model_small: 'Small',
        settings_model_small_desc: 'Haute précision. Idéal pour vocabulaire complexe.',
        settings_switching: 'Changement de modèle...',
        settings_switch_title: 'Changer de modèle',
        settings_switch_msg: 'Passer au modèle %{model} ? Cela peut nécessiter un téléchargement.',
        settings_switch_btn: 'Changer',
        settings_success_title: 'Succès',
        settings_success_msg: 'Passage au modèle %{model} réussi.',
        settings_error_title: 'Erreur',
        settings_error_msg: 'Échec du changement de modèle. Vérifiez votre connexion.',
    },
};

const i18n = new I18n(translations);

// Set default locale based on system
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export const initI18n = async () => {
    try {
        const settings = await StorageService.getSettings();

        if (settings.language === 'system') {
            const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';
            i18n.locale = deviceLanguage;
        } else {
            i18n.locale = settings.language;
        }
    } catch (e) {
        console.error('Failed to init i18n', e);
        // Fallback to system
        const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';
        i18n.locale = deviceLanguage;
    }
};

export const setAppLanguage = async (language: AppLanguage) => {
    if (language === 'system') {
        const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';
        i18n.locale = deviceLanguage;
    } else {
        i18n.locale = language;
    }
};

export default i18n;
