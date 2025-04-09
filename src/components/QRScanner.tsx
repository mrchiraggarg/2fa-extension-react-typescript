import React from 'react';
import QrReader from 'react-qr-reader';

type Props = {
  onScan: (secret: string, label: string) => void;
  onClose: () => void;
};

const QRScanner: React.FC<Props> = ({ onScan, onClose }) => {
  const handleScan = (data: string | null) => {
    if (!data) return;
    if (data.startsWith('otpauth://')) {
      const url = new URL(data);
      const secret = url.searchParams.get('secret') || '';
      const label = decodeURIComponent(url.pathname).split(':')[1] || 'Unnamed';
      onScan(secret, label);
    }
  };

  return (
    <div>
      <QrReader onScan={handleScan} onError={console.error} />
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default QRScanner;
