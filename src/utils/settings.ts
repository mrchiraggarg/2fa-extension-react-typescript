import { Settings } from '../types/types';

const defaultSettings: Settings = {
    darkMode: false,
    autoLock: true,
    notifications: true,
    biometrics: true,
};

export const getSettings = async (): Promise<Settings> => {
    const res = await chrome.storage.sync.get('settings');
    return { ...defaultSettings, ...(res.settings || {}) };
};

export const saveSettings = async (settings: Settings) => {
    await chrome.storage.sync.set({ settings });
};
