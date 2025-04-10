import React, { useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

type Props = {
  onScan: (secret: string, label: string) => void;
  onScanSuccess: (url: string) => void;
  onClose: () => void;
};

const QRScanner: React.FC<Props> = ({ onScan, onScanSuccess, onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (!reader.result) return;

      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const qrCodeScanner = new Html5Qrcode(/* just an ID, not a real DOM node needed */ 'html5qr-temp');

        const decoded = await qrCodeScanner.scanFile(file, true);

        if (decoded.startsWith('otpauth://')) {
          const url = new URL(decoded);
          const secret = url.searchParams.get('secret') || '';
          const label = decodeURIComponent(url.pathname).split(':')[1]?.replace('/', '') || 'Unnamed';

          if (secret) {
            onScan(secret, label);
            onScanSuccess(decoded);
          } else {
            alert('Secret not found in QR');
          }
        } else {
          alert('Not a valid OTP QR');
        }
      } catch (err) {
        console.error('QR decode failed:', err);
        alert('Failed to read QR from image');
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: '1rem', textAlign: 'center' }}>
      <h3>Select QR Image</h3>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
      />
      <button onClick={onClose} style={{ marginTop: '1rem' }}>Cancel</button>
    </div>
  );
};

export default QRScanner;
