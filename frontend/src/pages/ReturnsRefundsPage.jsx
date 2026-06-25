import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import { Search, Barcode, Package, FileSearch, Send } from 'lucide-react';

export default function ReturnsRefundsPage() {
  // State to hold the receipt ID input
  const [receiptId, setReceiptId] = useState('');

  return (
    <div className="space-y-6 fade-up">
      {/* Page Header */}
      <PageHeader
        title="Initiate Return"
        description="Verify receipt ID, select items to return, and state the reason."
      />

      {/* Main Grid Layout: 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Receipt Verification Card */}
          <Card>
            <CardContent className="pt-6">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Scan or Enter Receipt ID
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Barcode size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    value={receiptId}
                    onChange={(e) => setReceiptId(e.target.value)}
                    placeholder="TXN-88498B"
                    className="w-full text-sm rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <Button variant="primary" className="px-6">
                  <Search size={16} className="mr-2" />
                  Verify
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Select Items Card */}
          <Card className="min-h-[400px] flex flex-col">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Select Items
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-8">
              {/* Empty State when no receipt is verified */}
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FileSearch size={28} className="text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Ready to Verify</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Please click the 'Verify' button to validate the entered Receipt ID and load the purchased items.
              </p>
            </CardContent>
            {/* Submit Button (Disabled initially) */}
            <div className="p-4 border-t border-slate-100">
              <Button variant="outline" className="w-full h-12 bg-slate-400 text-white border-transparent cursor-not-allowed opacity-70" disabled>
                <Send size={16} className="mr-2" />
                Submit Return Request
              </Button>
            </div>
          </Card>

        </div>

        {/* Right Column (Spans 1 column) */}
        <div className="lg:col-span-1">
          {/* No Item Selected Empty State Card */}
          <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center mb-4">
              <Package size={24} className="text-slate-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-500">No Item Selected</h3>
          </Card>
        </div>

      </div>
    </div>
  );
}