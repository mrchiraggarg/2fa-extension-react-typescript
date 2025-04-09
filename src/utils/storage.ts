import { encrypt, decrypt } from './crypto';

export type Account = {
  label: string;
  secret: string;
  pinned?: boolean;
};

export const getAccounts = async (): Promise<Account[]> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['accounts'], async (result) => {
      const encryptedAccounts = result.accounts || [];
      const decrypted = await Promise.all(
        encryptedAccounts.map(async (enc: string) => {
          const raw = await decrypt(enc);
          return JSON.parse(raw) as Account;
        })
      );
      resolve(decrypted);
    });
  });
};

export const saveAccounts = async (accounts: Account[]) => {
  const encrypted = await Promise.all(
    accounts.map(async (acc) => {
      const raw = JSON.stringify(acc);
      return await encrypt(raw);
    })
  );
  return new Promise((resolve) => {
    chrome.storage.sync.set({ accounts: encrypted }, () => resolve(true));
  });
};

export const exportEncryptedData = async (): Promise<string> => {
  const { accounts } = await chrome.storage.sync.get(['accounts']);
  return JSON.stringify(accounts || []);
};

export const importEncryptedData = async (data: string): Promise<void> => {
  const parsed = JSON.parse(data);
  await chrome.storage.sync.set({ accounts: parsed });
};

