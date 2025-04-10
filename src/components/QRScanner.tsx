import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

type Props = {
  onScanSuccess: (url: string) => void;
  onScan: (secret: string, label: string) => void;
  onClose: () => void;
};

const QRScanner: React.FC<Props> = ({ onScanSuccess, onScan, onClose }) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    const html5QrCode = new Html5Qrcode(scannerRef.current.id);
    html5QrCodeRef.current = html5QrCode;

    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        const cameraId = devices[0].id;
        html5QrCode.start(
          cameraId,
          { fps: 10, qrbox: 250 },
          (scannedText) => {
            if (!scannedText.startsWith('otpauth://')) return;

            try {
              const url = new URL(scannedText);
              const secret = url.searchParams.get('secret') || '';
              const label = decodeURIComponent(url.pathname).split(':')[1]?.replace('/', '') || 'Unnamed';

              if (secret) {
                onScan(secret, label);
                onScanSuccess(scannedText);
                html5QrCode.stop().then(() => {
                  console.log('QR scanning stopped.');
                });
              }
            } catch (err) {
              alert('Invalid QR code');
              console.error(err);
            }
          },
          (errorMessage) => {
            // You can ignore scan errors, they're common
          }
        );
      }
    }).catch((err) => {
      console.error('Camera error:', err);
      alert('Camera access denied or not found.');
    });

    return () => {
      html5QrCode.stop().catch((err) => console.error('Failed to stop QR scanner', err));
    };
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h3>📷 Scan QR Code</h3>
      <div id="qr-reader" ref={scannerRef} style={{ width: '100%', height: '280px' }} />
      <button onClick={onClose} style={{ marginTop: '1rem' }}>Cancel</button>
    </div>
  );
};

export default QRScanner;
