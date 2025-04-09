import { getSettings, saveSettings } from './utils/settings';

export default function SetPasscode() {
  const [code, setCode] = useState('');

  const save = async () => {
    const hashed = await hash(code);
    const settings = await getSettings();
    settings.passcode = hashed;
    await saveSettings(settings);
    alert('Passcode set!');
  };

  return (
    <div>
      <input type="password" value={code} onChange={e => setCode(e.target.value)} />
      <button onClick={save}>Set Passcode</button>
    </div>
  );
}

async function hash(str: string): Promise<string> {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
