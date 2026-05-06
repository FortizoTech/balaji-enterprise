'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { BulkDeleteDialog } from '@/components/admin/BulkDeleteDialog';

export default function FinancesActions() {
    const router = useRouter();
    const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

    const executeBulkDelete = async () => {
        try {
            const res = await fetch('/api/admin/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entity: 'financials', deleteAll: true })
            });
            if (res.ok) {
                toast.success('All financial data purged');
                router.refresh();
            } else {
                toast.error('Bulk deletion failed');
            }
        } catch {
            toast.error('An error occurred during deletion');
        }
    };

    return (
        <div>
            <BulkActionBar
                selectedCount={0}
                onClearSelection={() => { }}
                onDeleteSelected={() => { }}
                onDeleteAll={() => setIsDeleteAllOpen(true)}
                entityName="Financial Records"
            />

            <BulkDeleteDialog
                isOpen={isDeleteAllOpen}
                onClose={() => setIsDeleteAllOpen(false)}
                onConfirm={executeBulkDelete}
                count={0}
                entityName="Financial Records"
                isDeleteAll={true}
            />
        </div>
    );
}
