import React, { useState } from 'react';
import { Account, getAccounts, saveAccounts } from '../utils/storage';
import QRScanner from './QRScanner';

type Props = {
  onAdd: () => void;
};

const AddAccountForm: React.FC<Props> = ({ onAdd }) => {
  const [label, setLabel] = useState('');
  const [secret, setSecret] = useState('');
  const [showQR, setShowQR] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!label || !secret) {
      alert('Label and Secret are required.');
      return;
    }

    const newAccount: Account = { label, secret };
    const current = await getAccounts();
    await saveAccounts([...current, newAccount]);
    onAdd();
    setLabel('');
    setSecret('');
  };

  const handleQRScan = (scannedSecret: string, scannedLabel: string) => {
    setLabel(scannedLabel);
    setSecret(scannedSecret);
    setShowQR(false);
  };

  return (
    <div className="add-account">
      {showQR ? (
        <QRScanner
          onScan={handleQRScan}
          onScanSuccess={(url) => console.log('Scanned:', url)}
          onClose={() => setShowQR(false)}
        />
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <input
              placeholder="NickName (e.g. GitHub)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
            <input
              placeholder="Secret (Base32)"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
            />
            <button type="submit">Add</button>
          </form>
          <button onClick={() => setShowQR(true)}>📷 Scan QR</button>
        </>
      )}
    </div>
  );
};

export default AddAccountForm;
