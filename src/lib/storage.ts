import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isNative = () => Capacitor.isNativePlatform();

export const storage = {
  async get(key: string): Promise<string | null> {
    if (isNative()) {
      const { value } = await Preferences.get({ key });
      return value;
    }
    return localStorage.getItem(key);
  },

  async set(key: string, value: string): Promise<void> {
    if (isNative()) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  },

  async remove(key: string): Promise<void> {
    if (isNative()) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  },

  async clearAll(): Promise<void> {
    if (isNative()) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  }
};

// Helper methods for specific keys
export const storageKeys = {
  TOKEN: 'token',
  MASJID_ID: 'masjid_id',
  USER: 'user',
  SHOLAT_TIMES: 'sholatTimes',
  SHOLAT_TIMES_DATE: 'sholatTimesDate'
} as const;

export const authStorage = {
  async getToken(): Promise<string | null> {
    return storage.get(storageKeys.TOKEN);
  },

  async setToken(token: string): Promise<void> {
    await storage.set(storageKeys.TOKEN, token);
  },

  async getMasjidId(): Promise<string | null> {
    return storage.get(storageKeys.MASJID_ID);
  },

  async setMasjidId(id: string): Promise<void> {
    await storage.set(storageKeys.MASJID_ID, id);
  },

  async getUser(): Promise<string | null> {
    return storage.get(storageKeys.USER);
  },

  async setUser(user: string): Promise<void> {
    await storage.set(storageKeys.USER, user);
  },

  async clearAll(): Promise<void> {
    await storage.clearAll();
  }
};

export const cacheStorage = {
  async getSholatTimes(): Promise<string | null> {
    return storage.get(storageKeys.SHOLAT_TIMES);
  },

  async setSholatTimes(times: string): Promise<void> {
    await storage.set(storageKeys.SHOLAT_TIMES, times);
  },

  async getSholatTimesDate(): Promise<string | null> {
    return storage.get(storageKeys.SHOLAT_TIMES_DATE);
  },

  async setSholatTimesDate(date: string): Promise<void> {
    await storage.set(storageKeys.SHOLAT_TIMES_DATE, date);
  }
};
