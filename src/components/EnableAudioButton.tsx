import { useState } from 'react';

export default function EnableAudioButton({ onAllow }: { onAllow: () => void }) {
    return (
        <button
        onClick={onAllow}
        className="p-2 bg-green-600 text-white rounded"
        >
        Klik untuk Mengaktifkan Suara
        </button>
    );
}
