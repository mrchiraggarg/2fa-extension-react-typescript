import React, { useEffect, useState } from 'react';
import QrScanner from 'react-qr-scanner';

type Props = {
    onScanSuccess: (url: string) => void;
    onScan: (secret: string, label: string) => void;
    onClose: () => void;
};

const QRScanner: React.FC<Props> = ({ onScanSuccess, onScan, onClose }) => {
    const [cameraAllowed, setCameraAllowed] = useState(true);
    const [cameraError, setCameraError] = useState<string | null>(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => setCameraAllowed(true))
            .catch((err) => {
                console.error('Camera access denied:', err);
                setCameraAllowed(false);
                setCameraError('Camera permission denied or not available.');
            });
    }, []);

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
        setCameraError('Error accessing camera.');
    };

    const previewStyle = {
        height: 240,
        width: '100%',
        objectFit: 'cover' as const,
        borderRadius: '12px',
    };

    return (
        <div style={{
            minHeight: '350px',
            padding: '1rem',
            textAlign: 'center',
            position: 'relative',
            background: '#111',
            color: '#fff',
            borderRadius: '12px'
        }}>
            <h3 style={{ marginBottom: '1rem' }}>Scan QR Code</h3>

            {!cameraAllowed ? (
                <p style={{ color: 'red' }}>{cameraError}</p>
            ) : (
                <QrScanner
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    style={previewStyle}
                />
            )}

            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'transparent',
                    color: '#fff',
                    border: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                }}
            >
                ✖
            </button>
        </div>
    );
};

export default QRScanner;
