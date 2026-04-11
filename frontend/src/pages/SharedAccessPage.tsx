import { sharedLinksApi } from '@/api/shared-links.api';
import { resolveApiUrl } from '@/api/client';
import axios from 'axios';
import { AlertTriangle, Download, FileText, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface AccessPayload {
    downloadUrl: string;
    documentName: string;
    mimeType: string;
    originalName: string;
}

export function SharedAccessPage() {
    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');
    const [payload, setPayload] = useState<AccessPayload | null>(null);

    useEffect(() => {
        const run = async () => {
            if (!token) {
                setError('Link invalido');
                setLoading(false);
                return;
            }

            try {
                const { data } = await sharedLinksApi.access(token);
                const result = data.data || data;
                setPayload(result);
            } catch (err: any) {
                setError(err.response?.data?.message || 'No fue posible acceder a este link');
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [token]);

    const handleDownload = async () => {
        if (!payload?.downloadUrl) return;
        setDownloading(true);
        try {
            const response = await axios.get(resolveApiUrl(payload.downloadUrl), { responseType: 'blob' });
            const blob = new Blob([response.data], { type: payload.mimeType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = payload.originalName || payload.documentName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(err.response?.data?.message || 'No se pudo descargar el documento');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-50 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-lg">
                {loading ? (
                    <div className="space-y-3">
                        <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-500" />
                        <p className="text-slate-500">Validando link...</p>
                    </div>
                ) : error ? (
                    <div className="space-y-4">
                        <AlertTriangle className="mx-auto h-9 w-9 text-red-500" />
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-lg font-semibold text-slate-800">Documento Compartido</h1>
                        <p className="text-sm text-slate-500 break-words">{payload?.documentName}</p>
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 transition-all"
                        >
                            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {downloading ? 'Descargando...' : 'Descargar Documento'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
