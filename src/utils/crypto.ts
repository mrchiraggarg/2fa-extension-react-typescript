const encoder = new TextEncoder();
const decoder = new TextDecoder();

const KEY_NAME = '2fa-key';

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function getKey(): Promise<CryptoKey> {
  let raw = localStorage.getItem(KEY_NAME);
  if (raw) {
    const keyBuffer = Uint8Array.from(atob(raw), c => c.charCodeAt(0));
    return crypto.subtle.importKey('raw', keyBuffer, 'AES-GCM', true, ['encrypt', 'decrypt']);
  } else {
    const key = await generateKey();
    const rawKey = await crypto.subtle.exportKey('raw', key);
    localStorage.setItem(KEY_NAME, btoa(String.fromCharCode(...new Uint8Array(rawKey))));
    return key;
  }
}

export async function encrypt(text: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = encoder.encode(text);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const encryptedBytes = new Uint8Array(encrypted);
  return btoa(`${String.fromCharCode(...iv)}${String.fromCharCode(...encryptedBytes)}`);
}

export async function decrypt(data: string): Promise<string> {
  const buffer = Uint8Array.from(atob(data), c => c.charCodeAt(0));
  const iv = buffer.slice(0, 12);
  const encrypted = buffer.slice(12);
  const key = await getKey();
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
  return decoder.decode(decrypted);
}
