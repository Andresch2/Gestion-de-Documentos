import type { AuditAction, AuditLog } from '@/types';
import { useAudit } from '@/hooks/useAudit';
import { formatDate } from '@/lib/utils';
import { Activity, Clock } from 'lucide-react';
import { useState } from 'react';

const actionLabel: Record<AuditAction, string> = {
    LOGIN: 'Inicio de sesion',
    LOGOUT: 'Cierre de sesion',
    REGISTER: 'Registro',
    UPLOAD: 'Subida de documento',
    DOWNLOAD: 'Descarga',
    DELETE: 'Envio a papelera',
    RESTORE: 'Restauracion',
    SHARE: 'Generacion de link',
    REVOKE_SHARE: 'Revocacion de link',
    UPDATE: 'Edicion de documento',
};

export function ActivityPage() {
    const [page, setPage] = useState(1);
    const [action, setAction] = useState<AuditAction | ''>('');

    const { data, isLoading } = useAudit({
        page,
        limit: 20,
        action: action || undefined,
    });

    const logs: AuditLog[] = data?.data || [];
    const meta = data?.meta;

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                        <Activity className="h-5 w-5 text-emerald-500" /> Historial de actividad
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Trazabilidad de acciones sobre tu cuenta y documentos
                    </p>
                </div>
                <div>
                    <label className="mb-1 block text-xs text-slate-500">Filtrar por accion</label>
                    <select
                        value={action}
                        onChange={(e) => {
                            setAction(e.target.value as AuditAction | '');
                            setPage(1);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="">Todas</option>
                        {Object.entries(actionLabel).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-16 rounded-xl border border-slate-200 bg-white animate-pulse" />
                    ))}
                </div>
            ) : logs.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
                    <Clock className="mx-auto mb-3 h-9 w-9 text-slate-400" />
                    <p className="text-slate-500">No hay eventos de actividad para este filtro.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {logs.map((log) => (
                        <div key={log.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-medium text-slate-800">{actionLabel[log.action]}</p>
                                <p className="text-xs text-slate-500">{formatDate(log.createdAt)}</p>
                            </div>
                            <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-slate-500 md:grid-cols-2">
                                <p>Documento: <span className="text-slate-800">{log.document?.name || 'N/A'}</span></p>
                                <p>IP: <span className="text-slate-800">{log.ipAddress || 'N/A'}</span></p>
                                <p className="truncate md:col-span-2">Agente: <span className="text-slate-800">{log.userAgent || 'N/A'}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {meta && meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                    {[...Array(meta.totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
