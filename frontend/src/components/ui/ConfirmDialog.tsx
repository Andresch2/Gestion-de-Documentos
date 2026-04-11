import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: 'danger' | 'warning';
    onConfirm: () => void;
    onClose: () => void;
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    tone = 'danger',
    onConfirm,
    onClose,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const toneStyles = tone === 'danger'
        ? {
            iconWrap: 'bg-red-50 text-red-600',
            confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500/30',
        }
        : {
            iconWrap: 'bg-amber-50 text-amber-600',
            confirmButton: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/30',
        };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneStyles.iconWrap}`}>
                            {tone === 'danger' ? <Trash2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-5 py-4">
                    <p className="text-sm leading-6 text-slate-600">{message}</p>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 ${toneStyles.confirmButton}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
