import React, { useRef } from 'react';
import jsQR from 'jsqr';

type Props = {
  onScanSuccess: (url: string) => void;
  onScan: (secret: string, label: string) => void;
  onClose: () => void;
};

const QRScanner: React.FC<Props> = ({ onScanSuccess, onScan, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code && code.data.startsWith('otpauth://')) {
        try {
          const url = new URL(code.data);
          const secret = url.searchParams.get('secret') || '';
          const label = decodeURIComponent(url.pathname).split(':')[1]?.replace('/', '') || 'Unnamed';

          if (secret) {
            onScan(secret, label);
            onScanSuccess(code.data);
          } else {
            alert('Secret not found in QR code.');
          }
        } catch (err) {
          alert('Failed to parse QR content.');
        }
      } else {
        alert('No valid QR code found.');
      }
    };
  };

  return (
    <div className='qr-upload' style={{ padding: '1rem' }}>
      <h3>📸 Upload a QR Code</h3>
      <input type="file" id='file' accept="image/*" onChange={handleFile} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button onClick={onClose} style={{ marginTop: '1rem' }}>Cancel</button>
    </div>
  );
};

export default QRScanner;
