// utils/hash.ts
export async function hash(text: string): Promise<string> {
    const buffer = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}
