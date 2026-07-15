import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { Card, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  useReceiptForVerification,
  useApproveAllItems,
  usePartialApproveItems,
  useRejectReceipt,
  useFlagForManager,
} from '../../hooks/useGoodsReceiving';

const STATUS_VARIANT = {
  MATCHED: 'success',
  SHORT: 'danger',
  EXCESS: 'info',
  DISCREPANCY: 'danger',
  VERIFIED: 'success',
  PENDING_VERIFICATION: 'warning',
  REJECTED: 'danger',
  DRAFT: 'neutral',
};

export default function VerificationScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: receipt, isLoading, isError } = useReceiptForVerification(id);

  const [notes, setNotes] = useState('');
  const [approvedItemIds, setApprovedItemIds] = useState([]);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const approveAll = useApproveAllItems(id);
  const partialApprove = usePartialApproveItems(id);
  const rejectReceipt = useRejectReceipt(id);
  const flagForManager = useFlagForManager(id);

  const toggleApproved = (itemId) =>
    setApprovedItemIds((ids) => (ids.includes(itemId) ? ids.filter((x) => x !== itemId) : [...ids, itemId]));

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }
  if (isError || !receipt) {
    return <p className="text-sm text-red-600">😕 Couldn't find that receipt. It may have been removed.</p>;
  }

  const hasDiscrepancies = receipt.discrepancyCount > 0;

  return (
    <>
      <PageHeader title="Verification Screen" description={`Verification – ${receipt.receiptNumber}`} />

      {hasDiscrepancies && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          ⚠️ Discrepancy detected — {receipt.discrepancyCount} item(s) differ from PO quantities. Please review before
          approving.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent>
            <p className="text-xs text-slate-500">Receipt #</p>
            <p className="text-lg font-semibold text-slate-900 mt-1">{receipt.receiptNumber}</p>
            <p className="text-xs text-slate-400 mt-0.5">{new Date(receipt.deliveryDate).toLocaleDateString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-slate-500">Supplier</p>
            <p className="text-lg font-semibold text-slate-900 mt-1">{receipt.supplier?.name || '—'}</p>
            <p className="text-xs text-slate-400 mt-0.5">{receipt.poNumber}</p>
          </CardContent>
        </Card>
        <Card className={hasDiscrepancies ? 'border-amber-300 bg-amber-50/40' : ''}>
          <CardContent>
            <p className="text-xs text-slate-500">Discrepancies</p>
            <p className="text-lg font-semibold text-slate-900 mt-1">{receipt.discrepancyCount}</p>
            <p className="text-xs text-slate-400 mt-0.5">items flagged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-slate-500">Status</p>
            <div className="mt-1">
              <Badge variant={STATUS_VARIANT[receipt.status] || 'neutral'}>{receipt.status.replace(/_/g, ' ')}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-sm font-semibold text-slate-700 mb-3">Item Verification</h2>
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white mb-6">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3.5">Product</th>
              <th className="px-6 py-3.5">SKU</th>
              <th className="px-6 py-3.5">Ordered</th>
              <th className="px-6 py-3.5">Received</th>
              <th className="px-6 py-3.5">Diff</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Verify</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {receipt.items.map((item) => {
              const isChecked = approvedItemIds.includes(item._id) || item.verifyStatus === 'APPROVED';
              return (
                <tr key={item._id} className={item.itemStatus !== 'MATCHED' ? 'bg-amber-50/40' : ''}>
                  <td className="px-6 py-4">{item.productName}</td>
                  <td className="px-6 py-4 text-slate-500">{item.sku}</td>
                  <td className="px-6 py-4">{item.orderedQty}</td>
                  <td className="px-6 py-4">{item.receivedQty}</td>
                  <td
                    className={`px-6 py-4 font-medium ${
                      item.difference > 0 ? 'text-blue-600' : item.difference < 0 ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {item.difference > 0 ? `+${item.difference}` : item.difference}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={STATUS_VARIANT[item.itemStatus] || 'neutral'}>{item.itemStatus}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    {item.itemStatus === 'MATCHED' ? (
                      <span className="text-emerald-600 text-xs font-medium">Approved</span>
                    ) : (
                      <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                        <input type="checkbox" checked={isChecked} onChange={() => toggleApproved(item._id)} />
                        Approve
                      </label>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-medium text-slate-500 mb-1">Verification Notes</label>
        <textarea
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[90px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none"
          placeholder="Add notes about discrepancies, damaged goods, or supplier response…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3 justify-between">
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => setShowRejectConfirm(true)} disabled={rejectReceipt.isPending}>
            Reject Receipt
          </Button>
          <Button
            variant="outline"
            onClick={() => flagForManager.mutate(notes)}
            disabled={flagForManager.isPending}
          >
            {flagForManager.isPending ? 'Flagging… ⏳' : 'Flag for Manager'}
          </Button>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              partialApprove.mutate(
                { approvedItemIds, notes },
                { onSuccess: () => navigate('/goods-receiving') }
              )
            }
            disabled={partialApprove.isPending}
          >
            {partialApprove.isPending ? 'Working… ⏳' : 'Partial Approve'}
          </Button>
          <Button
            variant="primary"
            onClick={() => approveAll.mutate(notes, { onSuccess: () => navigate('/goods-receiving') })}
            disabled={approveAll.isPending}
          >
            {approveAll.isPending ? 'Working… ⏳' : 'Approve All'}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={() => rejectReceipt.mutate(notes, { onSuccess: () => navigate('/goods-receiving') })}
        title="Reject this receipt?"
        message="This marks the whole receipt as rejected and can't be undone. Make sure you've added a note explaining why. 📝"
        confirmText="Yes, Reject"
        type="danger"
      />
    </>
  );
}
