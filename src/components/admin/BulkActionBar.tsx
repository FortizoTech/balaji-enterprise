'use client';

import { Trash2, X, AlertOctagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BulkActionBarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onDeleteSelected: () => void;
    onDeleteAll?: () => void;
    entityName?: string;
}

export function BulkActionBar({ selectedCount, onClearSelection, onDeleteSelected, onDeleteAll, entityName = "items" }: BulkActionBarProps) {
    return (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-6 mt-4">
            <div className="flex items-center gap-4">
                <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-100">
                    <button
                        onClick={onClearSelection}
                        disabled={selectedCount === 0}
                        className="p-1.5 hover:bg-white rounded-md transition-all text-gray-400 hover:text-gray-700 disabled:opacity-50"
                        title="Clear selection"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <span className="text-sm font-body font-medium text-gray-700">
                    {selectedCount > 0 ? (
                        <span className="text-[#C5A572]">{selectedCount} selected</span>
                    ) : (
                        `Manage ${entityName}`
                    )}
                </span>

                <AnimatePresence>
                    {selectedCount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: -10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: -10 }}
                            className="flex items-center gap-3"
                        >
                            <div className="h-4 w-px bg-gray-200" />
                            <button
                                onClick={onDeleteSelected}
                                className="text-xs font-body font-bold uppercase tracking-wider text-red-600 hover:text-red-700 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Selected
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {onDeleteAll && (
                <button
                    onClick={onDeleteAll}
                    className="text-xs font-body font-bold uppercase tracking-wider text-red-600 hover:text-white flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-600 hover:border-red-600 hover:shadow-[0_4px_10px_rgba(220,38,38,0.2)] transition-all group"
                >
                    <AlertOctagon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Purge All {entityName}
                </button>
            )}
        </div>
    );
}
