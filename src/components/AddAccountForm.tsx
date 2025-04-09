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
    const newAccount: Account = { label, secret };
    const current = await getAccounts();
    await saveAccounts([...current, newAccount]);
    onAdd();
    setLabel('');
    setSecret('');
  };

  const handleQRScan = (secret: string, label: string) => {
    setLabel(label);
    setSecret(secret);
    setShowQR(false);
  };


  return (
    <>
      {showQR ? (
        <QRScanner onScan={handleQRScan} onClose={() => setShowQR(false)} />
      ) : (

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
          <input
            placeholder="Secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
          />
          <button type="submit">Add</button>
        </form>
      )}
    </>
  );
};

export default AddAccountForm;
