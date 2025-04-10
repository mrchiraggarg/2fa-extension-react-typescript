import React from 'react';
import QrScanner from 'react-qr-scanner';

type Props = {
  onScan: (secret: string, label: string) => void;
  onClose: () => void;
};

const QRScanner: React.FC<Props> = ({ onScan, onClose }) => {
  const handleScan = (data: { text: string } | null) => {
    if (!data?.text) return;

    const scanned = data.text;

    if (scanned.startsWith('otpauth://')) {
      const url = new URL(scanned);
      const secret = url.searchParams.get('secret') || '';
      const label = decodeURIComponent(url.pathname).split(':')[1] || 'Unnamed';
      onScan(secret, label);
    }
  };

  const handleError = (err: any) => {
    console.error('QR Scan Error:', err);
  };

  return (
    <div>
      <QrScanner
        delay={300}
        style={{ width: '100%' }}
        onError={handleError}
        onScan={handleScan}
      />
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default QRScanner;
