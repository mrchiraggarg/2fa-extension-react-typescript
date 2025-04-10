import React, { useEffect, useState } from 'react';
import { Account, getAccounts, exportEncryptedData, importEncryptedData } from './utils/storage';
import { getSettings, saveSettings } from './utils/settings';
import AccountComponent from './components/Account';
import AddAccountForm from './components/AddAccountForm';
import { hash } from './utils/hash';
import './popup.css';


const App: React.FC = () => {
  const [locked, setLocked] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [settings, setSettings] = useState<any>();
  const [passInput, setPassInput] = useState('');
  const [failedBiometric, setFailedBiometric] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(
    localStorage.getItem('dark') === 'true'
  );

  const handleUnlock = async () => {
    try {
      if (settings?.biometrics) {
        await navigator.credentials.get({ publicKey: { challenge: new Uint8Array([1, 2, 3]) } });
        setLocked(false);
      } else {
        setFailedBiometric(true);
      }
    } catch (e) {
      setFailedBiometric(true);
    }
  };

  const handlePasscodeSubmit = async () => {
    const hashed = await hash(passInput);
    if (hashed === settings?.passcode) setLocked(false);
    else alert('Wrong passcode');
  };

  const loadAccounts = async () => {
    const data = await getAccounts();
    const sorted = [...data].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    setAccounts(sorted);
  };

  const handleExport = async () => {
    const data = await exportEncryptedData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup.json';
    a.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const text = await file.text();
    await importEncryptedData(text);
    loadAccounts();
  };

  useEffect(() => {
    getSettings().then(setSettings);
    Notification.requestPermission();
  }, []);

  useEffect(() => {
    if (settings?.darkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('dark', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const updateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const newTime = 30 - (now % 30);
      setTimeLeft(newTime);

      if (newTime === 30 && Notification.permission === 'granted') {
        new Notification('🔐 OTPs Refreshed', {
          body: 'Your 2FA codes have just been updated.',
        });
      }
    };

    updateTime();
    const timer = setInterval(() => {
      updateTime();
      loadAccounts();
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setLocked(true), 3 * 60 * 1000);
    };

    ['click', 'keydown', 'mousemove'].forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();
    return () => clearTimeout(timeout);
  }, []);

  if (locked) {
    return (
      <div className="App">
        <h3>{failedBiometric ? '🔐 Enter Passcode' : '🔒 Locked'}</h3>
        {failedBiometric ? (
          <>
            <input
              type="password"
              value={passInput}
              onChange={e => setPassInput(e.target.value)}
            />
            <button onClick={handlePasscodeSubmit}>Unlock</button>
          </>
        ) : (
          <button onClick={handleUnlock}>Unlock</button>
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <input type="file" accept="application/json" onChange={handleImport} />
      <button onClick={handleExport}>Export Backup</button>
      <button className="toggle-dark" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️' : '🌙'}
      </button>
      <h2>2FA Authenticator</h2>
      <h3>Next code refresh in: {timeLeft}s</h3>
      {accounts.map((acc, i) => (
        <AccountComponent account={acc} key={i} onDelete={loadAccounts} onUpdate={loadAccounts} />
      ))}
      <AddAccountForm onAdd={loadAccounts} />
    </div>
  );
};

export default App;