import React from 'react';
import { authenticator } from 'otplib';
import { Account } from '../utils/storage';

type Props = {
  account: Account;
  onDelete: () => void;
  onUpdate: () => void;
};


const AccountComponent: React.FC<Props> = ({ account }) => {
  const otp = authenticator.generate(account.secret);

  const handlePinToggle = async () => {
    const list = await getAccounts();
    const updated = list.map(acc =>
      acc.label === account.label ? { ...acc, pinned: !acc.pinned } : acc
    );
    await saveAccounts(updated);
    onUpdate();
  };

  const handleDelete = async () => {
    const existing = await getAccounts();
    const updated = existing.filter(a => a.label !== account.label);
    await saveAccounts(updated);
    onDelete();
  };

  return (
    <div className="account">
      <strong>{account.label}</strong>: {otp}
      <button onClick={handlePinToggle}>
        {account.pinned ? '📌' : '📍'}
      </button>
      <button onClick={handleDelete}>🗑</button>
    </div>
  );
};

export default AccountComponent;
