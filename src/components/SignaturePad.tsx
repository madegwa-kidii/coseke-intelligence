// components/SignaturePad.tsx
'use client';

import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function SignaturePad({ onSave }: { onSave: (dataUrl: string) => void }) {
    const sigCanvas = useRef<SignatureCanvas>(null);

    const clear = () => sigCanvas.current?.clear();

    const save = () => {
        if (sigCanvas.current?.isEmpty()) {
            alert('Please provide a signature first.');
            return;
        }
        // Exports as a base64 Data URL (PNG)
        const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png') || '';
        onSave(dataUrl);
    };

    return (
        <div className="flex flex-col gap-4 p-4 border rounded-lg max-w-md bg-white">
            <h3 className="font-semibold text-gray-700">Draw Your Signature</h3>
            <div className="border border-dashed border-gray-300 rounded bg-gray-50">
                <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{ className: 'w-full h-48 signature-canvas' }}
                />
            </div>
            <div className="flex gap-2 justify-end">
                <button onClick={clear} className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
                    Clear
                </button>
                <button onClick={save} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    Capture
                </button>
            </div>
        </div>
    );
}
