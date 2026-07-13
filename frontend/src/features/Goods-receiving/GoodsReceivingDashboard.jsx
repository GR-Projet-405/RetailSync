import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { Card, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import DataTable from '../../components/DataTable';
import Spinner from '../../components/Spinner';
import { useDashboardStats } from '../../hooks/useGoodsReceiving';
import GoodsReceiptForm from "../Goods-receiving/GoodsReceiptForm";
import ReceivingItemsHistory from "../Goods-receiving/ReceivedItemsHistory";
import VerificationScreen from "../Goods-receiving/VerificationScreen";

const STATUS_VARIANT = {
  VERIFIED: 'success',
  PENDING_VERIFICATION: 'warning',
  DISCREPANCY: 'danger',
  DRAFT: 'neutral',
  REJECTED: 'danger',
};

export default function GoodsReceivingDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError } = useDashboardStats();

  const columns = [
    { key: 'receiptNumber', header: 'Receipt #' },
    { key: 'supplier', header: 'Supplier', render: (row) => row.supplier || '—' },
    { key: 'items', header: 'Items' },
    {
      key: 'date',
      header: 'Date',
      render: (row) =>
        new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || 'neutral'}>{row.status.replace(/_/g, ' ')}</Badge>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => navigate(`/goods-receiving/verify/${row.id}`)}
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
       title="Receiving Dashboard"
        description="Today's goods receiving activity at a glance 📦"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/ReceivingItemsHistory')}>
              Received Item History
            </Button>
            <Button onClick={() => navigate('/GoodsReceiptForm')}>+ New Receipt</Button>
          </div>
        }
      />
      {/* <PageHeader
        
      /> */}

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-600">😕 Couldn't load the dashboard right now. Please try again shortly.</p>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent>
                <p className="text-sm text-slate-500">Today's Receipts</p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">{stats.todaysReceipts}</p>
                <p className={`text-xs mt-1 ${stats.receiptsDeltaFromYesterday >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {stats.receiptsDeltaFromYesterday >= 0 ? '↑' : '↓'} {Math.abs(stats.receiptsDeltaFromYesterday)} from
                  yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <p className="text-sm text-slate-500">Items Received</p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">
                  {stats.itemsReceivedThisWeek?.toLocaleString()}
                </p>
                <p className={`text-xs mt-1 ${stats.itemsChangePct >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {stats.itemsChangePct >= 0 ? '↑' : '↓'} {Math.abs(stats.itemsChangePct)}% this week
                </p>
              </CardContent>
            </Card>

            {/* <Card className={stats.pendingVerification > 0 ? 'border-amber-300 bg-amber-50/40' : ''}>
              <CardContent>
                <p className="text-sm text-slate-500">Pending Verification</p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">{stats.pendingVerification}</p>
                <p className={`text-xs mt-1 ${stats.pendingVerification > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {stats.pendingVerification > 0 ? '⚠️ Needs attention' : '✅ All caught up'}
                </p>
              </CardContent>
            </Card> */}
            {/* verification screen  */}
            <Card
                          onClick={() => navigate('/VerificationScreen')}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && navigate('/VerificationScreen')}
                          className={`cursor-pointer transition hover:shadow-md ${
                            stats.pendingVerification > 0 ? 'border-amber-300 bg-amber-50/40' : ''
                          }`}
                        >
                          <CardContent>
                            <p className="text-sm text-slate-500">Pending Verification</p>
                            <p className="text-2xl font-semibold text-slate-900 mt-2">{stats.pendingVerification}</p>
                            <p className={`text-xs mt-1 ${stats.pendingVerification > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {stats.pendingVerification > 0 ? '⚠️ Needs attention' : '✅ All caught up'}
                            </p>
                          </CardContent>
                        </Card>

            <Card>
              <CardContent>
                <p className="text-sm text-slate-500">Avg. Processing Time</p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">{stats.avgProcessingTimeMinutes}m</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent Receipts</h2>
          <DataTable
            columns={columns}
            data={stats.recentReceipts}
            emptyMessage="No receipts yet — create your first one! 📦"
          />
        </>
      )}
    </>
  );
}
