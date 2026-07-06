import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import Spinner from '../../components/Spinner';
import { useReceivingReports } from '../../hooks/useGoodsReceiving';

export default function ReceivingReports() {
  const now = new Date();
  const [filters] = useState({ month: now.getMonth(), year: now.getFullYear() });
  const { data: report, isLoading, isError } = useReceivingReports(filters);

  const maxDaily = Math.max(1, ...(report?.dailyReceipts?.map((d) => d.count) || [1]));
  const maxVolume = Math.max(1, ...(report?.topSuppliers?.map((s) => s.volume) || [1]));

  const discrepancyColumns = [
    { key: 'supplier', header: 'Supplier' },
    { key: 'receipts', header: 'Receipts' },
    {
      key: 'discrepancies',
      header: 'Discrepancies',
      render: (row) => <span className={row.discrepancies > 0 ? 'text-red-600' : 'text-slate-600'}>{row.discrepancies}</span>,
    },
    { key: 'rate', header: 'Rate', render: (row) => `${row.rate}%` },
  ];

  return (
    <>
      <PageHeader
        title="Receiving Reports"
        description="Trends and supplier performance for the selected period 📈"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">PDF</Button>
            <Button variant="primary">Export Report</Button>
          </div>
        }
      />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}
      {isError && <p className="text-sm text-red-600">😕 Couldn't load the report. Please try again.</p>}

      {report && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent>
                <p className="text-sm text-slate-500">Total Receipts</p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">{report.totalReceipts}</p>
                <p className={`text-xs mt-1 ${report.receiptsChangePct >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {report.receiptsChangePct >= 0 ? '↑' : '↓'} {Math.abs(report.receiptsChangePct)}% vs last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-sm text-slate-500">Total Items Received</p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">
                  {report.totalItemsReceived?.toLocaleString()}
                </p>
                <p className={`text-xs mt-1 ${report.itemsChangePct >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {report.itemsChangePct >= 0 ? '↑' : '↓'} {Math.abs(report.itemsChangePct)}% vs last month
                </p>
              </CardContent>
            </Card>
            <Card className={report.discrepancyRate > 5 ? 'border-amber-300 bg-amber-50/40' : ''}>
              <CardContent>
                <p className="text-sm text-slate-500">Discrepancy Rate</p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">{report.discrepancyRate}%</p>
                <p className={`text-xs mt-1 ${report.discrepancyRate > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {report.discrepancyRate > 5 ? '⚠️ Higher than usual' : '✅ Within normal range'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-sm text-slate-500">Avg. Processing Time</p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">{report.avgProcessingTimeMinutes} min</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Receipts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-48">
                  {report.dailyReceipts?.map((d) => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-blue-500"
                        style={{ height: `${(d.count / maxDaily) * 100}%`, minHeight: 4 }}
                        title={`Day ${d.day}: ${d.count} receipts`}
                      />
                      <span className="text-[10px] text-slate-400">{d.day}</span>
                    </div>
                  ))}
                  {(!report.dailyReceipts || report.dailyReceipts.length === 0) && (
                    <p className="text-sm text-slate-400 m-auto">No receipts yet this period 📭</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Suppliers by Volume</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.topSuppliers?.map((s) => (
                  <div key={s.supplier}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">{s.supplier}</span>
                      <span className="text-slate-500">{s.volume.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${(s.volume / maxVolume) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {(!report.topSuppliers || report.topSuppliers.length === 0) && (
                  <p className="text-sm text-slate-400">No supplier data yet 📭</p>
                )}
              </CardContent>
            </Card>
          </div>

          <h2 className="text-sm font-semibold text-slate-700 mb-3">Discrepancy Summary</h2>
          <DataTable
            columns={discrepancyColumns}
            data={report.discrepancySummary}
            emptyMessage="Nothing to report for this period yet ✨"
          />
        </>
      )}
    </>
  );
}
