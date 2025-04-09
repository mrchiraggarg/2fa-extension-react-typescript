import React, { useEffect, useState } from 'react';
import { Account, getAccounts } from './utils/storage';
import AccountComponent from './components/Account';
import AddAccountForm from './components/AddAccountForm';
import './popup.css';

const App: React.FC = () => {
  const [locked, setLocked] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [settings, setSettings] = useState<Settings>();
  const [passInput, setPassInput] = useState('');
  const [failedBiometric, setFailedBiometric] = useState(false);

  const handleUnlock = async () => {
    try {
      if (settings?.biometrics) {
        await navigator.credentials.get({ publicKey: { challenge: new Uint8Array([1, 2, 3]) } });
        setLocked(false);
      } else {
        setFailedBiometric(true);
      }
    } catch (e) {
      setFailedBiometric(true); // fallback to passcode
    }
  };

  const handlePasscodeSubmit = async () => {
    const hashed = await hash(passInput);
    if (hashed === settings?.passcode) {
      setLocked(false);
    } else {
      alert('Wrong passcode');
    }
  };

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setLocked(true), 3 * 60 * 1000); // 3 min
    };

    ['click', 'keydown', 'mousemove'].forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();
    return () => clearTimeout(timeout);
  }, []);


  const load = async () => {
    const data = await getAccounts();
    setAccounts(data);
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
    load();
  };

  useEffect(() => {
    const updateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      setTimeLeft(30 - (now % 30));
    };

    updateTime(); // initialize immediately
    const timer = setInterval(() => {
      updateTime();
      load(); // refresh OTP every second
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [darkMode, setDarkMode] = useState<boolean>(
    localStorage.getItem('dark') === 'true'
  );

  useEffect(() => {
    // Apply dark mode
    useEffect(() => {
      if (settings?.darkMode) document.body.classList.add('dark');
      else document.body.classList.remove('dark');
    }, [settings]);

    localStorage.setItem('dark', darkMode.toString());
  }, [darkMode]);

  const load = async () => {
    const data = await getAccounts();
    const sorted = [...data].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    setAccounts(sorted);
  };

  useEffect(() => {
    Notification.requestPermission();
  }, []);


  if (locked && !failedBiometric) {
    return (
      <div className="App">
        <h3>🔒 Locked</h3>
        <button onClick={handleUnlock}>Unlock</button>
      </div>
    );
  } else if (locked && failedBiometric) {
    return (
      <div className="App">
        <h3>🔐 Enter Passcode</h3>
        <input type="password" value={passInput} onChange={e => setPassInput(e.target.value)} />
        <button onClick={handlePasscodeSubmit}>Unlock</button>
      </div>
    );
  } else if (locked) {
    const handleUnlock = async () => {
      try {
        await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array([1, 2, 3]),
            timeout: 60000,
            allowCredentials: [],
            userVerification: 'required',
          },
        });
        setLocked(false);
      } catch (err) {
        alert('Authentication failed!');
      }
    };

    return (
      <div className="App">
        <h3>🔒 Locked due to inactivity</h3>
        <button onClick={() => setLocked(false)}>Unlock</button>
      </div>
    );
  } else {
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
          <AccountComponent account={acc} key={i} onDelete={load} />
        ))}
        <AddAccountForm onAdd={load} />
      </div>
    );
  }
};

export default App;
