import React from 'react';
import QrScanner from 'react-qr-scanner';

type Props = {
    onScanSuccess: (url: string) => void;
    onScan: (secret: string, label: string) => void;
    onClose: () => void;
};

const QRScanner: React.FC<Props> = ({ onScanSuccess, onScan, onClose }) => {
    const handleScan = (data: { text?: string } | null) => {
        if (!data?.text) return;

        const scanned = data.text;

        try {
            if (scanned.startsWith('otpauth://')) {
                const url = new URL(scanned);
                const secret = url.searchParams.get('secret') || '';
                const label = decodeURIComponent(url.pathname).split(':')[1]?.replace('/', '') || 'Unnamed';

                if (secret) {
                    onScan(secret, label);
                    onScanSuccess(scanned);
                } else {
                    alert('No secret found in QR Code.');
                }
            } else {
                alert('Invalid QR Code format');
            }
        } catch (err) {
            console.error('Failed to parse QR:', err);
            alert('Failed to parse QR Code.');
        }
    };

    const handleError = (err: any) => {
        console.error('QR Scan Error:', err);
    };

    const previewStyle = {
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
        borderRadius: '12px',
        overflow: 'hidden',
    };

    return (
        <div className="qr-modal">
            <h3>Scan QR Code</h3>
            <QrScanner
                delay={300}
                style={previewStyle}
                onError={handleError}
                onScan={handleScan}
            />
            <button onClick={onClose}>Cancel</button>
        </div>
    );
};

export default QRScanner;
