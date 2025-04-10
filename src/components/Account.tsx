import React from 'react';
import { authenticator } from 'otplib';
import { Account, getAccounts, saveAccounts } from '../utils/storage';

type Props = {
  account: Account;
  onDelete: () => void;
  onUpdate: () => void;
};

const AccountComponent: React.FC<Props> = ({ account, onDelete, onUpdate }) => {
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
    const list = await getAccounts();
    const updated = list.filter(acc => acc.label !== account.label);
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
