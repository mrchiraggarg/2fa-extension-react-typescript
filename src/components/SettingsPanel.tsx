import React, { useState } from 'react';
import { getSettings, saveSettings } from '../utils/settings';
import { hash } from '../utils/hash';

const SettingsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [biometrics, setBiometrics] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');

  React.useEffect(() => {
    getSettings().then((s) => {
      setBiometrics(s.biometrics);
      setDarkMode(s.darkMode);
    });
  }, []);

  const handleSave = async () => {
    const updates: any = {
      biometrics,
      darkMode,
    };
    if (newPasscode) {
      updates.passcode = await hash(newPasscode);
    }
    await saveSettings(updates);
    alert('Settings updated');
    onClose();
    window.location.reload(); // refresh UI for dark mode or other changes
  };

  return (
    <div className="settings-panel">
      <h3>Settings</h3>
      <label>
        <input
          type="checkbox"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
        />
        Enable Dark Mode
      </label>
      <label>
        <input
          type="checkbox"
          checked={biometrics}
          onChange={() => setBiometrics(!biometrics)}
        />
        Enable Biometrics
      </label>
      <label>
        Set New Passcode:
        <input
          type="password"
          value={newPasscode}
          onChange={(e) => setNewPasscode(e.target.value)}
        />
      </label>
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default SettingsPanel;
