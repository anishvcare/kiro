import { useState, useEffect } from 'react';
import socket from '../services/socket';

export default function QRConnect({ status }) {
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    socket.on('qr', (qrImage) => setQrCode(qrImage));
    return () => socket.off('qr');
  }, []);

  const connected = status.status === 'connected';

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center">📱 WhatsApp Connect</h2>

      <div className="bg-white rounded-lg shadow p-6 border text-center">
        {connected ? (
          <div className="space-y-4">
            <div className="text-6xl">✅</div>
            <h3 className="text-xl font-bold text-green-600">Connected!</h3>
            <p className="text-gray-600">Auto-reply active aanu</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold">QR Code Scan Cheyyuka</h3>
            {qrCode ? (
              <img src={qrCode} alt="QR" className="mx-auto w-64 h-64 border-4 border-[#25D366] rounded-lg" />
            ) : (
              <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-sm text-gray-500">QR loading...</p>
                  <p className="text-xs text-gray-400">Server ready aayaal QR varum</p>
                </div>
              </div>
            )}
            <div className="bg-gray-50 p-4 rounded-lg text-left text-sm">
              <p className="font-semibold mb-2">📋 Steps:</p>
              <ol className="space-y-1 text-gray-600">
                <li>1. WhatsApp open cheyyuka</li>
                <li>2. Settings → Linked Devices</li>
                <li>3. "Link a Device" click</li>
                <li>4. QR code scan cheyyuka</li>
              </ol>
            </div>
          </div>
        )}
        <div className={`mt-4 p-2 rounded text-sm ${connected ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {status.message}
        </div>
      </div>
    </div>
  );
}
