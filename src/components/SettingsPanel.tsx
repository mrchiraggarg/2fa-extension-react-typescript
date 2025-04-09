import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from './utils/settings';
import { Settings } from './types';

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const handleToggle = (key: keyof Settings) => {
    if (!settings) return;
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveSettings(updated);
  };

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="settings">
      <h3>⚙️ Settings</h3>
      {Object.entries(settings).map(([key, value]) => (
        <label key={key}>
          <input
            type="checkbox"
            checked={value}
            onChange={() => handleToggle(key as keyof Settings)}
          />
          {key}
        </label>
      ))}
    </div>
  );
}
