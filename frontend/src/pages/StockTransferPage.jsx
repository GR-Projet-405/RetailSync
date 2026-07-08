import { useState, useEffect, useCallback } from 'react';
import { TrendingUp,Clock,Bookmark,Search,Trash2,Edit3,ChevronDown,ChevronUp,Check,Truck,MoreHorizontal,X,Highlighter} from 'lucide-react';
import * as stockTransferService from '../services/stockTransferService';

export default function StockTransferPage() {
  const [activeTab, setActiveTab] = useState('monitoring'); // monitoring, request, approvals, track, history
  
  // Data States
  const [transfers, setTransfers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tab 2: New Request States
  const [sourceWH, setSourceWH] = useState('');
  const [destWH, setDestWH] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedProductStock, setSelectedProductStock] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [requestItems, setRequestItems] = useState([]);
  const [requestNotes, setRequestNotes] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [requestedDate, setRequestedDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState('MEDIUM');

  // Tab 3: Pending Approvals States
  const [expandedTransferId, setExpandedTransferId] = useState(null);

  // Tab 4: Track Transfer States
  const [trackTransferId, setTrackTransferId] = useState('');
  const [tempDriverSelector, setTempDriverSelector] = useState('Kamal Perera');
  const [tempDriverName, setTempDriverName] = useState('Kamal Perera');
  const [tempVehicleNumber, setTempVehicleNumber] = useState('WP-CAM-1025');
  const [tempDriverLocation, setTempDriverLocation] = useState('Main Branch HQ');

  // Tab 5: History States

  const [highlightedRows, setHighlightedRows] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deletedIds, setDeletedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [historyPage, setHistoryPage] = useState(1);

  // Success modal after submitting request
  const [successModal, setSuccessModal] = useState(null); // holds the submitted transfer data

  // Notifications
  const [notification, setNotification] = useState(null);

  // Derived States
  const trackingData = trackTransferId ? transfers.find(t => t._id === trackTransferId) || null : null;

  const tempEstimatedTime = (() => {
    if (!trackingData) return '30 Minutes';
    const srcName = trackingData.sourceBranch?.name || 'Main Branch HQ';
    const dstName = trackingData.destinationBranch?.name || 'Main Branch HQ';

    const coords = {
      'Main Branch HQ': { x: 0, y: 0 },
      'Downtown Store': { x: 3, y: 4 },
      'Westside Outlet': { x: -6, y: 8 },
    };

    const getDistance = (locA, locB) => {
      const ptA = coords[locA] || { x: 0, y: 0 };
      const ptB = coords[locB] || { x: 0, y: 0 };
      const dx = ptA.x - ptB.x;
      const dy = ptA.y - ptB.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const dist1 = getDistance(tempDriverLocation, srcName);
    const dist2 = getDistance(srcName, dstName);
    const totalDist = dist1 + dist2;

    const minutes = Math.round(totalDist * 3 + 10);
    if (minutes < 60) {
      return `${minutes} Minutes`;
    } else {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hrs} Hr ${mins} Mins` : `${hrs} Hr`;
    }
  })();

  // 1. Notifications Helper
  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // 2. Fetch Init Data
  const fetchData = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      // Fetch transfers
      const transRes = await stockTransferService.getTransfers();
      setTransfers(transRes.data || []);
      
      // Fetch branches
      const branchRes = await stockTransferService.getBranches();
      setBranches(branchRes.data || []);
      
      // Fetch products
      const prodRes = await stockTransferService.getProducts();
      setProducts(prodRes.data || []);

      // Set default tracking ID if none is set
      const trackingList = (transRes.data || []).filter(t => ['PENDING', 'APPROVED', 'PICKED_UP', 'IN_TRANSIT'].includes(t.status));
      if (trackingList.length > 0) {
        setTrackTransferId(prev => prev || trackingList[0]._id);
      }
    } catch (err) {
      console.error('Error fetching stock transfers data:', err);
      showNotification('error', err.message || 'Failed to fetch stock transfers.');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await fetchData();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [fetchData]);

  // Sync driver inputs to selected tracking data (if trackingData already has them saved)
  useEffect(() => {
    if (!trackingData) return;

    Promise.resolve().then(() => {
      if (trackingData.driverName && trackingData.driverName !== 'Pending Assignment') {
        setTempDriverName(trackingData.driverName);
        const driverKey = ['Kamal Perera', 'Nimal Silva', 'Suneth Perera'].includes(trackingData.driverName) ? trackingData.driverName : 'Custom';
        setTempDriverSelector(driverKey);

        if (driverKey === 'Kamal Perera') setTempDriverLocation('Downtown Store');
        else if (driverKey === 'Nimal Silva') setTempDriverLocation('Main Branch HQ');
        else if (driverKey === 'Suneth Perera') setTempDriverLocation('Westside Outlet');
      } else {
        setTempDriverName('Kamal Perera');
        setTempDriverSelector('Kamal Perera');
        setTempDriverLocation('Downtown Store');
      }
      if (trackingData.vehicleNumber && trackingData.vehicleNumber !== 'Pending Assignment') {
        setTempVehicleNumber(trackingData.vehicleNumber);
      } else {
        setTempVehicleNumber('WP-CAM-1025');
      }
    });
  }, [trackingData]);

  // Fetch product stock at source when product/source changes
  useEffect(() => {
    const checkStock = async () => {
      if (sourceWH && selectedProduct) {
        try {
          const invRes = await stockTransferService.getInventory(sourceWH);
          const item = (invRes.data || []).find(i => i.productId?._id === selectedProduct._id);
          setSelectedProductStock(item ? item.quantity : 0);
        } catch (err) {
          console.error('Error checking inventory stock:', err);
          setSelectedProductStock(0);
        }
      } else {
        setSelectedProductStock(null);
      }
    };
    checkStock();
  }, [sourceWH, selectedProduct]);

  // Tab 2 Actions: Items Builder
  const handleAddRequestItem = () => {
    if (!selectedProduct) {
      showNotification('warning', 'Please select a product first.');
      return;
    }

    const existing = requestItems.find(item => item.productId === selectedProduct._id);
    if (existing) {
      showNotification('warning', 'Product already added to list.');
      return;
    }

    if (selectedProductStock === 0) {
      showNotification('warning', 'Cannot transfer item. Stock is 0 at source.');
      return;
    }

    const newItem = {
      productId: selectedProduct._id,
      sku: selectedProduct.sku,
      name: selectedProduct.name,
      currentStock: selectedProductStock || 0,
      quantityTransferred: 1, // Default to 1
    };

    setRequestItems([...requestItems, newItem]);
    setSelectedProduct(null);
    setSearchProduct('');
  };

  const handleUpdateItemQty = (productId, qty) => {
    const parsedQty = parseInt(qty, 10);
    if (isNaN(parsedQty) || parsedQty < 1) return;

    setRequestItems(requestItems.map(item => {
      if (item.productId === productId) {
        if (parsedQty > item.currentStock) {
          showNotification('warning', `Requested quantity exceeds available stock (${item.currentStock}).`);
        }
        return { ...item, quantityTransferred: parsedQty };
      }
      return item;
    }));
  };

  const handleRemoveRequestItem = (productId) => {
    setRequestItems(requestItems.filter(item => item.productId !== productId));
  };

  const handleSubmitRequest = async () => {
    if (!sourceWH || !destWH) {
      showNotification('warning', 'Please select both source and destination.');
      return;
    }
    if (sourceWH === destWH) {
      showNotification('warning', 'Source and Destination cannot be the same.');
      return;
    }
    if (requestItems.length === 0) {
      showNotification('warning', 'Please add at least one item to transfer.');
      return;
    }

    // Verify quantity check before submitting
    const overLimit = requestItems.some(item => item.quantityTransferred > item.currentStock);
    if (overLimit) {
      showNotification('warning', 'Some items exceed available stock levels. Please adjust quantities.');
      return;
    }

    try {
      const payload = {
        sourceBranch: sourceWH,
        destinationBranch: destWH,
        notes: requestNotes,
        priority: priority,
        requestedDate: requestedDate,
        items: requestItems.map(item => ({
          productId: item.productId,
          quantityTransferred: item.quantityTransferred
        }))
      };

      const response = await stockTransferService.createTransfer(payload);

      // Capture source/dest names for display in modal
      const srcBranch = branches.find(b => b._id === sourceWH);
      const dstBranch = branches.find(b => b._id === destWH);

      // Show success popup with full request info
      setSuccessModal({
        transferNumber: response.data?.transferNumber || 'N/A',
        source: srcBranch?.name || 'Unknown',
        destination: dstBranch?.name || 'Unknown',
        notes: requestNotes,
        priority: priority,
        requestedDate: requestedDate,
        items: requestItems.map(item => ({
          sku: item.sku,
          name: item.name,
          qty: item.quantityTransferred,
        })),
        totalQty: requestItems.reduce((s, i) => s + i.quantityTransferred, 0),
        submittedAt: new Date().toLocaleString(),
      });

      // Clear form
      setRequestItems([]);
      setSourceWH('');
      setDestWH('');
      setRequestNotes('');
      setRequestedDate(new Date().toISOString().split('T')[0]);
      setPriority('MEDIUM');

      // Refresh list in background (no tab switch)
      fetchData();
    } catch (err) {
      showNotification('error', err.message || 'Failed to submit transfer request.');
    }
  };

  // Tab 3 Actions: Approve / Reject
  const handleApprove = async (transferId, e) => {
    e.stopPropagation();
    try {
      await stockTransferService.updateTransferStatus(transferId, 'APPROVED', 'Request approved by manager.');
      showNotification('success', 'Transfer request approved successfully!');
      await fetchData();
    } catch (err) {
      showNotification('error', err.message || 'Failed to approve transfer.');
    }
  };

  const handleReject = async (transferId, e) => {
    e.stopPropagation();
    try {
      await stockTransferService.updateTransferStatus(transferId, 'REJECTED', 'Request rejected by manager.');
      showNotification('success', 'Transfer request rejected.');
      await fetchData();
    } catch (err) {
      showNotification('error', err.message || 'Failed to reject transfer.');
    }
  };

  // Tab 4 actions (Mock tracking state updates for demonstrating workflow)
  const handleStepForward = async (transfer) => {
    const nextStatuses = {
      'PENDING': 'APPROVED',
      'APPROVED': 'PICKED_UP',
      'PICKED_UP': 'IN_TRANSIT',
      'IN_TRANSIT': 'DELIVERED',
    };
    const next = nextStatuses[transfer.status];
    if (!next) return;

    try {
      let driverDetails = {};
      if (transfer.status === 'APPROVED') {
        driverDetails = {
          driverName: tempDriverName || 'Kamal Perera',
          vehicleNumber: tempVehicleNumber || 'WP-CAM-1025',
          estimatedTime: tempEstimatedTime || '30 Minutes'
        };
      }
      await stockTransferService.updateTransferStatus(transfer._id, next, `Moving to next step: ${next}`, driverDetails);
      showNotification('success', `Transfer updated to ${next}`);
      await fetchData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleCancelTrack = async (transferId) => {
    try {
      await stockTransferService.updateTransferStatus(transferId, 'CANCELLED', 'Cancelled by tracking page.');
      showNotification('success', 'Transfer cancelled.');
      await fetchData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };



  // Helper getters
  const getPendingTransfers = () => transfers.filter(t => t.status === 'PENDING');
  const getActiveTransfers = () => transfers.filter(t => ['APPROVED', 'PICKED_UP', 'IN_TRANSIT'].includes(t.status));
  const getFinishedTransfersCount = () => transfers.filter(t => t.status === 'DELIVERED').length;

  const getFilteredHistoryTransfers = () => {
    return transfers.filter(t => {
      // Status Filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'DELIVERED' && t.status !== 'DELIVERED') return false;
        if (statusFilter === 'CANCELLED' && t.status !== 'CANCELLED') return false;
        if (statusFilter === 'REJECTED' && t.status !== 'REJECTED') return false;
        if (statusFilter === 'ACTIVE' && !['PENDING', 'APPROVED', 'PICKED_UP', 'IN_TRANSIT'].includes(t.status)) return false;
      }
      // Location Filter (From or To)
      if (locationFilter !== 'All') {
        const fromName = t.sourceBranch?.name || '';
        const toName = t.destinationBranch?.name || '';
        if (fromName !== locationFilter && toName !== locationFilter) return false;
      }
      return true;
    });
  };

  const ITEMS_PER_PAGE = 12;

  const getPaginatedHistoryTransfers = () => {
    const filtered = getFilteredHistoryTransfers().filter(row => !deletedIds.includes(row._id));
    const startIndex = (historyPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  // Format Dates
  const formatDateString = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Sleek Alert Notifications */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl fade-in transition-all duration-300 ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          notification.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
          'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          <div className="text-sm font-semibold">{notification.message}</div>
          <button onClick={() => setNotification(null)} className="hover:opacity-70">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs Header - Custom sleek pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl max-w-3xl">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
            activeTab === 'monitoring' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Status Monitoring
        </button>
        <button
          onClick={() => setActiveTab('request')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
            activeTab === 'request' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          New Request
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 relative ${
            activeTab === 'approvals' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pending Approvals
          {getPendingTransfers().length > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold text-white bg-red-500 rounded-full">
              {getPendingTransfers().length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('track')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
            activeTab === 'track' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Track Transfer
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
            activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Transfer History
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">Loading database records...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: STATUS MONITORING */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-950">Status Monitoring</h1>
                <p className="text-slate-500 text-sm mt-0.5">Check the summaries of the Distributions</p>
              </div>

              {/* Metric Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Active */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-slate-900">{getActiveTransfers().length}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 block">In Transit</span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                {/* Card 2: Pending */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-slate-900">{getPendingTransfers().length}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 block">Awaiting Approvals</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                {/* Card 3: Finished */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Finished</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-slate-900">{getFinishedTransfersCount()}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 block">Completed/Month</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                    <Bookmark className="w-6 h-6" />
                  </div>
                </div>
              </div>

              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Transfer Status Distribution</h3>                                  
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3B82F6" strokeWidth="3.2" 
                          strokeDasharray="50 100" strokeDashoffset="0" />
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="3.2" 
                          strokeDasharray="25 100" strokeDashoffset="-50" />
                        
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F59E0B" strokeWidth="3.2" 
                          strokeDasharray="15 100" strokeDashoffset="-75" />
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#EF4444" strokeWidth="3.2" 
                          strokeDasharray="10 100" strokeDashoffset="-90" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-slate-800">{transfers.length}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Total</span>
                      </div>
                    </div>

                 
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                        <span>Pending</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                        <span>In Transit</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                        <span>Delivered</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                        <span>Cancelled</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Track Distributions */}
                <div className="lg:col-span-7 bg-white border border-slate-150 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <h3 className="text-base font-bold text-slate-900">Track Distributions</h3>
                      <span className="text-xs font-semibold text-slate-400">{getActiveTransfers().length} In Progress</span>
                    </div>
                    
                    <div className="space-y-2.5 max-h-56 overflow-y-auto">
                      {getActiveTransfers().map((t) => (
                        <div 
                          key={t._id} 
                          onClick={() => {
                            setTrackTransferId(t._id);
                            setActiveTab('track');
                          }}
                          className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-100 cursor-pointer transition-colors duration-150"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">Track Transfer :</span>
                            <span className="text-sm font-bold text-blue-600">{t.transferNumber}</span>
                          </div>
                                                 
                          {t.status === 'PICKED_UP' ? (
                            <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md uppercase tracking-wider">
                              Picked Up
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 rounded-md uppercase tracking-wider">
                              In Transit
                            </span>
                          )}
                        </div>
                      ))}
                      {getActiveTransfers().length === 0 && (
                        <div className="py-12 text-center text-slate-400 text-sm">
                          No active distributions in progress.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>             
              <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Activity Log</h3>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors duration-150"
                  >
                    View All Logs &gt;&gt;
                  </button>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <th className="pb-3 px-4">Date</th>
                        <th className="pb-3 px-4">From</th>
                        <th className="pb-3 px-4">To</th>
                        <th className="pb-3 px-4 text-center">Quantity</th>
                        <th className="pb-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {transfers.slice(0, 3).map((row, idx) => (
                        <tr key={row._id || idx} className="hover:bg-slate-50/40">
                          <td className="py-4 px-4 font-semibold text-slate-500">{formatDateString(row.createdAt)}</td>
                          <td className="py-4 px-4 font-bold text-slate-800">{row.sourceBranch?.name}</td>
                          <td className="py-4 px-4 font-bold text-slate-800">{row.destinationBranch?.name}</td>
                          <td className="py-4 px-4 font-bold text-center text-slate-950">
                            {row.items.reduce((sum, item) => sum + item.quantityTransferred, 0)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            {row.status === 'DELIVERED' ? (
                              <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 rounded-md uppercase">
                                Delivered
                              </span>
                            ) : row.status === 'CANCELLED' ? (
                              <span className="px-2.5 py-1 text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 rounded-md uppercase">
                                Cancelled
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 rounded-md uppercase">
                                {row.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NEW REQUEST */}
          {activeTab === 'request' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-950">New Transfer Request</h1>
                <p className="text-slate-500 text-sm mt-0.5">Send New transfer Requests</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Card: Select Locations */}
                <div className="lg:col-span-7 bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-5">
                  <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">New Transfer Request</h3>
                  
                  {/* Source Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Source</label>
                    <select
                      value={sourceWH}
                      onChange={(e) => {
                        setSourceWH(e.target.value);
                        setRequestItems([]); // Reset items list if source changes
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Source WH</option>
                      {branches.map(b => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Destination Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Destination</label>
                    <select
                      value={destWH}
                      onChange={(e) => setDestWH(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Destination</option>
                      {branches.map(b => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Requested Date & Priority — same row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Requested Date */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Requested Date</label>
                      <input
                        type="date"
                        value={requestedDate}
                        onChange={(e) => setRequestedDate(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                      />
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Card: Search & Add Product */}
                <div className="lg:col-span-5 bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-5">
                  <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">Add Items</h3>
                  
                  {/* Product Autocomplete Search */}
                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Search SKU/Item Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search SKU/Item Name"
                        value={searchProduct}
                        onFocus={() => setShowProductDropdown(true)}
                        onChange={(e) => {
                          setSearchProduct(e.target.value);
                          setShowProductDropdown(true);
                        }}
                        className="w-full p-3 pl-10 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!sourceWH}
                      />
                      <Search className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                    </div>

                    {!sourceWH && (
                      <p className="text-[10px] text-amber-600 font-semibold mt-1">
                        * Select a Source WH first to search products and see stock.
                      </p>
                    )}

                    {/* Autocomplete Dropdown list */}
                    {showProductDropdown && sourceWH && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowProductDropdown(false)} />
                        <div className="absolute left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto py-1 divide-y divide-slate-50">
                          {products
                            .filter(p => 
                              p.sku.toLowerCase().includes(searchProduct.toLowerCase()) || 
                              p.name.toLowerCase().includes(searchProduct.toLowerCase())
                            )
                            .map(p => (
                              <button
                                key={p._id}
                                onClick={() => {
                                  setSelectedProduct(p);
                                  setSearchProduct(`${p.sku} - ${p.name}`);
                                  setShowProductDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                              >
                                <span className="font-semibold text-slate-700">{p.sku} - {p.name}</span>
                                <span className="text-xs text-slate-400 font-medium">${p.price}</span>
                              </button>
                            ))}
                          {products.length === 0 && (
                            <div className="p-3 text-center text-slate-400 text-xs">No products found.</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Stock Display info */}
                  {selectedProduct && selectedProductStock !== null && (
                    <div className="flex items-center justify-between px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                      <span className="text-xs font-semibold text-slate-500">Stock at Source WH:</span>
                      <span className={`text-sm font-bold ${selectedProductStock > 0 ? 'text-slate-800' : 'text-red-500'}`}>
                        {selectedProductStock} Units
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleAddRequestItem}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors duration-150 text-sm"
                  >
                    Add Item
                  </button>
                </div>
              </div>

              {/* Items List Table Card */}
              <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <th className="pb-3 px-4">Item Code / SKU</th>
                        <th className="pb-3 px-4 text-center">Current Stock</th>
                        <th className="pb-3 px-4 text-center">Transfer Qty</th>
                        <th className="pb-3 px-4 text-right">Edit/Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {requestItems.map((item) => (
                        <tr key={item.productId} className="hover:bg-slate-50/40">
                          {/* Item Code (SKU) */}
                          <td className="py-4 px-4 font-bold text-slate-800">{item.sku}</td>
                          
                          {/* Current Stock */}
                          <td className="py-4 px-4 text-center font-semibold text-slate-500">{item.currentStock}</td>
                                                
                          <td className="py-4 px-4">
                            <div className="flex justify-center">
                              <input
                                type="number"
                                value={item.quantityTransferred}
                                onChange={(e) => handleUpdateItemQty(item.productId, e.target.value)}
                                className="w-20 p-1.5 border border-slate-200 rounded-lg text-center font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                min="1"
                                max={item.currentStock}
                              />
                            </div>
                          </td>
                          
                          {/* Actions */}
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-3 text-slate-400">
                              <button className="hover:text-blue-600">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleRemoveRequestItem(item.productId)} className="hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {requestItems.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                            No items added to request list yet. Use the add form above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Additional Notes Box — always visible */}
                <div className="pt-4 space-y-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Transfer Notes / Reason</label>
                  <textarea
                    placeholder="Add transfer reasons or carrier notes..."
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 text-slate-700"
                    rows="2"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setRequestItems([]);
                      setSourceWH('');
                      setDestWH('');
                      setRequestNotes('');
                      setActiveTab('monitoring');
                    }}
                    className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-colors duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors duration-150"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/*  TAB 3: PENDING APPROVALS */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-950">Pending Approvals</h1>
                <p className="text-slate-500 text-sm mt-0.5">Approve and Reject the Requests</p>
              </div>

              {/* Collapsible Pending Approvals Table */}
              <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <th className="pb-3 px-4">ID</th>
                        <th className="pb-3 px-4">Requested Date</th>
                        <th className="pb-3 px-4">Priority</th>
                        <th className="pb-3 px-4">Source WH</th>
                        <th className="pb-3 px-4">Destination</th>
                        <th className="pb-3 px-4 text-center">Quantity</th>
                        <th className="pb-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {getPendingTransfers().map((t) => {
                        const isExpanded = expandedTransferId === t._id;
                        return (
                          <>
                            {/* Main row */}
                            <tr 
                              key={t._id} 
                              onClick={() => setExpandedTransferId(isExpanded ? null : t._id)}
                              className="hover:bg-slate-50/40 cursor-pointer transition-all"
                            >
                              <td className="py-4 px-4 font-bold text-slate-800">{t.transferNumber}</td>
                              <td className="py-4 px-4">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-700 text-xs">{formatDateString(t.requestedDate || t.createdAt)}</span>
                                  <span className="text-[10px] text-slate-400">{new Date(t.requestedDate || t.createdAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true})}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                {(() => {
                                  const p = t.priority || 'MEDIUM';
                                  const colors = { LOW: 'bg-slate-100 text-slate-600', MEDIUM: 'bg-blue-50 text-blue-700', HIGH: 'bg-amber-50 text-amber-700', URGENT: 'bg-red-50 text-red-600' };
                                  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${colors[p]}`}>{p}</span>;
                                })()}
                              </td>
                              <td className="py-4 px-4 font-bold text-slate-800">{t.sourceBranch?.name}</td>
                              <td className="py-4 px-4 font-bold text-slate-800">{t.destinationBranch?.name}</td>
                              <td className="py-4 px-4 font-bold text-center text-slate-950">
                                {t.items.reduce((sum, item) => sum + item.quantityTransferred, 0)}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center justify-end gap-2.5">
                                  <button
                                    onClick={(e) => handleApprove(t._id, e)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={(e) => handleReject(t._id, e)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm"
                                  >
                                    Reject
                                  </button>
                                  <span className="text-slate-400">
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </span>
                                </div>
                              </td>
                            </tr>

                            {/* Nested Item Breakdown Row */}
                            {isExpanded && (
                              <tr className="bg-blue-50/40">
                                <td colSpan="7" className="p-0 border-t border-slate-100">
                                  <div className="px-10 py-5 space-y-4">
                                    {/* Nested Table */}
                                    <table className="w-full text-left">
                                      <thead>
                                        <tr className="border-b border-blue-100/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                          <th className="pb-2">Item Breakdown</th>
                                          <th className="pb-2">Item Name</th>
                                          <th className="pb-2 text-center">Current Stock</th>
                                          <th className="pb-2 text-center">Requested Qty</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-blue-50/30 text-xs font-semibold text-slate-700">
                                        {t.items.map((item, idx) => (
                                          <tr key={idx} className="py-2.5">
                                            <td className="py-2 font-bold text-slate-500">{item.productId?.sku || 'SKU-0001'}</td>
                                            <td className="py-2 text-slate-700">{item.productId?.name || 'Wireless Mouse'}</td>
                                            <td className="py-2 text-center text-slate-500">15</td>
                                            <td className="py-2 text-center text-slate-900">{item.quantityTransferred}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                      {getPendingTransfers().length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-16 text-center text-slate-400 font-semibold text-sm">
                            No pending stock transfer requests awaiting approvals.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRACK TRANSFER */}
          {activeTab === 'track' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-950">
                    Track Transfer : {trackingData?.transferNumber || '#TR-001'}
                  </h1>
                  <p className="text-slate-500 text-sm mt-0.5">Track your transfer status</p>
                </div>
                
                {/* Select dropdown to switch tracking target */}
                <select
                  value={trackTransferId}
                  onChange={(e) => setTrackTransferId(e.target.value)}
                  className="p-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white font-bold focus:outline-none"
                >
                  <option value="">Track Transfer - Select</option>
                  {transfers.map(t => (
                    <option key={t._id} value={t._id}>Track Transfer - {t.transferNumber}</option>
                  ))}
                </select>
              </div>

              {trackingData ? (
                <>
                  <div className="bg-white border border-slate-150 rounded-2xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-8">Steps</h3>
                    
                   
                    <div className="relative flex items-start justify-between px-6 pt-2 pb-6">                     
                      <div className="absolute left-6 right-6 top-7 h-1 bg-slate-100 z-0" />                    
                      <div
                        className="absolute left-6 top-7 h-1 bg-blue-600 z-0 transition-all duration-500"
                        style={{
                          right: trackingData.status === 'PENDING'    ? 'calc(100% - 24px)' :
                                 trackingData.status === 'APPROVED'   ? '75%' :
                                 trackingData.status === 'PICKED_UP'  ? '50%' :
                                 trackingData.status === 'IN_TRANSIT' ? '25%' : '24px'
                        }}
                      />

                      {/* Step 1: Requested */}
                      <div className="flex flex-col items-center gap-1 z-10 w-1/5">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-blue-600 text-white shadow-md border-4 border-white">
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 text-center">Requested</span>
                        {(() => { const e = (trackingData.statusHistory||[]).find(h=>h.status==='PENDING') || {updatedAt: trackingData.createdAt}; const d=e&&new Date(e.updatedAt); return d?(<><span className="text-[10px] font-semibold text-slate-500 text-center">{d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</span><span className="text-[10px] text-slate-400 text-center">{d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true})}</span></>):null; })()}
                      </div>

                      {/* Step 2: Approved */}
                      <div className="flex flex-col items-center gap-1 z-10 w-1/5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white transition-all duration-300 ${
                          ['APPROVED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(trackingData.status)
                            ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {['APPROVED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(trackingData.status) ? (
                            <Check className="w-4 h-4" />
                          ) : '2'}
                        </div>
                        <span className="text-xs font-bold text-slate-800 text-center">Approved</span>
                        {(() => { const e=(trackingData.statusHistory||[]).find(h=>h.status==='APPROVED'); const d=e&&new Date(e.updatedAt); return d?(<><span className="text-[10px] font-semibold text-emerald-600 text-center">{d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</span><span className="text-[10px] text-slate-400 text-center">{d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true})}</span></>):(<span className="text-[10px] text-slate-300 italic text-center">Pending</span>); })()}
                      </div>

                      {/* Step 3: Pickup */}
                      <div className="flex flex-col items-center gap-1 z-10 w-1/5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white transition-all duration-300 ${
                          ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(trackingData.status)
                            ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(trackingData.status) ? (
                            <Check className="w-4 h-4" />
                          ) : '3'}
                        </div>
                        <span className="text-xs font-bold text-slate-800 text-center">Pickup</span>
                        {(() => { const e=(trackingData.statusHistory||[]).find(h=>h.status==='PICKED_UP'); const d=e&&new Date(e.updatedAt); return d?(<><span className="text-[10px] font-semibold text-amber-600 text-center">{d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</span><span className="text-[10px] text-slate-400 text-center">{d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true})}</span></>):(<span className="text-[10px] text-slate-300 italic text-center">Pending</span>); })()}
                      </div>

                      {/* Step 4: In Transit */}
                      <div className="flex flex-col items-center gap-1 z-10 w-1/5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white transition-all duration-300 ${
                          ['IN_TRANSIT', 'DELIVERED'].includes(trackingData.status)
                            ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {['IN_TRANSIT', 'DELIVERED'].includes(trackingData.status) ? (
                            <Check className="w-4 h-4" />
                          ) : '4'}
                        </div>
                        <span className="text-xs font-bold text-slate-800 text-center">In Transit</span>
                        {(() => { const e=(trackingData.statusHistory||[]).find(h=>h.status==='IN_TRANSIT'); const d=e&&new Date(e.updatedAt); return d?(<><span className="text-[10px] font-semibold text-blue-600 text-center">{d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</span><span className="text-[10px] text-slate-400 text-center">{d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true})}</span></>):(<span className="text-[10px] text-slate-300 italic text-center">Pending</span>); })()}
                      </div>

                      {/* Step 5: Delivered */}
                      <div className="flex flex-col items-center gap-1 z-10 w-1/5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white transition-all duration-300 ${
                          trackingData.status === 'DELIVERED'
                            ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {trackingData.status === 'DELIVERED' ? (
                            <Check className="w-4 h-4" />
                          ) : '5'}
                        </div>
                        <span className="text-xs font-bold text-slate-800 text-center">Delivered</span>
                        {(() => { const e=(trackingData.statusHistory||[]).find(h=>h.status==='DELIVERED'); const d=e&&new Date(e.updatedAt); return d?(<><span className="text-[10px] font-semibold text-purple-600 text-center">{d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</span><span className="text-[10px] text-slate-400 text-center">{d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true})}</span></>):(<span className="text-[10px] text-slate-300 italic text-center">Pending</span>); })()}
                      </div>

                    </div>

                    {/* Step simulator controls for testing & presentation */}
                    {['PENDING', 'APPROVED', 'PICKED_UP', 'IN_TRANSIT'].includes(trackingData.status) && (
                      <div className="mt-8 pt-6 border-t border-slate-100">
                        {trackingData.status === 'APPROVED' && (
                          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-6 space-y-4 shadow-inner">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <Truck className="w-4 h-4 text-blue-600" /> Assign Driver & Transport Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              {/* Driver Selection */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500">Driver Name</label>
                                 <div className="flex flex-col gap-2">
                                   <select
                                     value={tempDriverSelector}
                                     onChange={(e) => {
                                       const val = e.target.value;
                                       setTempDriverSelector(val);
                                       if (val !== 'Custom') {
                                         setTempDriverName(val);
                                         if (val === 'Kamal Perera') {
                                           setTempVehicleNumber('WP-CAM-1025');
                                           setTempDriverLocation('Downtown Store');
                                         } else if (val === 'Nimal Silva') {
                                           setTempVehicleNumber('WP-CAD-4096');
                                           setTempDriverLocation('Main Branch HQ');
                                         } else if (val === 'Suneth Perera') {
                                           setTempVehicleNumber('WP-CBA-9876');
                                           setTempDriverLocation('Westside Outlet');
                                         }
                                       } else {
                                         setTempDriverName('');
                                         setTempVehicleNumber('');
                                       }
                                     }}
                                     className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                   >
                                     <option value="Kamal Perera">Kamal Perera</option>
                                     <option value="Nimal Silva">Nimal Silva</option>
                                     <option value="Suneth Perera">Suneth Perera</option>
                                     <option value="Custom">Custom / Other</option>
                                   </select>
                                   
                                   {tempDriverSelector === 'Custom' && (
                                     <input
                                       type="text"
                                       placeholder="Enter Driver Name"
                                       value={tempDriverName}
                                       onChange={(e) => setTempDriverName(e.target.value)}
                                       className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                     />
                                   )}
                                 </div>
                              </div>

                              {/* Driver Starting Location */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500">Driver Starting Location</label>
                                <select
                                  value={tempDriverLocation}
                                  onChange={(e) => setTempDriverLocation(e.target.value)}
                                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                  <option value="Main Branch HQ">Main Branch HQ</option>
                                  <option value="Downtown Store">Downtown Store</option>
                                  <option value="Westside Outlet">Westside Outlet</option>
                                </select>
                              </div>

                              {/* Vehicle Number */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500">Vehicle Number</label>
                                {tempDriverSelector === 'Custom' ? (
                                  <input
                                    type="text"
                                    placeholder="e.g. WP-CAM-1234"
                                    value={tempVehicleNumber}
                                    onChange={(e) => setTempVehicleNumber(e.target.value)}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                  />
                                ) : (
                                  <div className="w-full p-2 border border-slate-200 bg-slate-100 rounded-lg text-sm font-semibold text-slate-600">
                                    {tempVehicleNumber}
                                  </div>
                                )}
                              </div>

                              {/* Estimated Time (Auto-calculated) */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                  Estimated Duration <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded border border-emerald-100 uppercase tracking-wider font-extrabold">Auto</span>
                                </label>
                                <div className="w-full p-2 border border-blue-100 bg-blue-50/50 rounded-lg text-sm font-bold text-blue-700 flex items-center justify-between">
                                  <span>{tempEstimatedTime}</span>
                                  <span className="text-[9px] text-blue-500 font-semibold italic">Based on location</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleCancelTrack(trackingData._id)}
                            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg"
                          >
                            Cancel Transfer
                          </button>
                          <button
                            onClick={() => handleStepForward(trackingData)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                          >
                            Simulate Next Step &gt;
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shipment & Item details panels */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shipment Details Panel */}
                    <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4">
                      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Shipment Details</h3>
                      
                      <div className="space-y-3.5 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-400">Driver Name</span>
                          <span className="font-bold text-slate-800">: {trackingData.driverName || 'Kamal Perera'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-400">Vehicle Number</span>
                          <span className="font-bold text-slate-800">: {trackingData.vehicleNumber || 'WP-CAM-1025'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-400">Tracking Number</span>
                          <span className="font-bold text-slate-800">: {trackingData.trackingNumber || '#TR-001'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-400">Estimated Time</span>
                          <span className="font-bold text-slate-800">: {trackingData.estimatedTime || '30 Minutes'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-400">Status</span>
                          <span className="font-bold text-slate-800">: {trackingData.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Item Details Panel */}
                    <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4">
                      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Item Details</h3>
                      
                      <div className="w-full overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                              <th className="pb-2">Item Code</th>
                              <th className="pb-2 text-right">Qty</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                            {trackingData.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="py-3 font-bold text-slate-800">{item.productId?.sku || 'SKU - 0001'}</td>
                                <td className="py-3 text-right font-bold text-slate-900">{item.quantityTransferred}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-20 text-center text-slate-400 text-sm bg-white border border-slate-150 rounded-2xl shadow-sm">
                  Select an active transfer from the dropdown above to track its step status.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TRANSFER HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-950">Transfer History</h1>
                <p className="text-slate-500 text-sm mt-0.5">Check the History of Transfers have been Done</p>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="ACTIVE">Active (Transit)</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
             
                <div className="relative">
                  <select
                    className="p-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Data Range</option>
                    <option>Today</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div className="relative">
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">Specific Location</option>
                    {branches.map(b => (
                      <option key={b._id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <th className="pb-3 px-4">Date</th>
                        <th className="pb-3 px-4">From</th>
                        <th className="pb-3 px-4">To</th>
                        <th className="pb-3 px-4 text-center">Quantity</th>
                        <th className="pb-3 px-4">Status</th>
                        <th className="pb-3 px-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {getPaginatedHistoryTransfers().map((row) => {
                        const isHighlighted = highlightedRows.includes(row._id);
                        const isMenuOpen = openMenuId === row._id;
                        return (
                          <tr
                            key={row._id}
                            className={`transition-colors duration-150 ${
                              isHighlighted
                                ? 'bg-yellow-50 border-l-4 border-l-yellow-400'
                                : 'hover:bg-slate-50/40'
                            }`}
                          >
                            {/* Date */}
                            <td className="py-4 px-4 font-semibold text-slate-500">{formatDateString(row.createdAt)}</td>

                            {/* Source */}
                            <td className="py-4 px-4 font-bold text-slate-800">{row.sourceBranch?.name}</td>

                            {/* Destination */}
                            <td className="py-4 px-4 font-bold text-slate-800">{row.destinationBranch?.name}</td>

                            {/* Quantity */}
                            <td className="py-4 px-4 font-bold text-center text-slate-950">
                              {row.items.reduce((sum, item) => sum + item.quantityTransferred, 0)}
                            </td>

                            {/* Status Badges */}
                            <td className="py-4 px-4">
                              {row.status === 'DELIVERED' ? (
                                <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 rounded-md uppercase">
                                  Delivered
                                </span>
                              ) : row.status === 'CANCELLED' ? (
                                <span className="px-2.5 py-1 text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 rounded-md uppercase">
                                  Cancelled
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 rounded-md uppercase">
                                  {row.status}
                                </span>
                              )}
                            </td>

                            {/* Action Menu */}
                            <td className="py-4 px-4 text-right">
                              <div className="relative inline-block">
                                <button
                                  onClick={() => setOpenMenuId(isMenuOpen ? null : row._id)}
                                  className={`p-1.5 rounded-lg transition-colors duration-150 ${
                                    isMenuOpen
                                      ? 'bg-slate-100 text-slate-700'
                                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>

                                {/* Dropdown Panel */}
                                {isMenuOpen && (
                                  <>
                                    {/* Click-away overlay */}
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={() => setOpenMenuId(null)}
                                    />
                                    <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 overflow-hidden fade-in">
                                      {/* Highlight Option */}
                                      <button
                                        onClick={() => {
                                          setHighlightedRows(prev =>
                                            prev.includes(row._id)
                                              ? prev.filter(id => id !== row._id)
                                              : [...prev, row._id]
                                          );
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors duration-150"
                                      >
                                        <Highlighter className="w-3.5 h-3.5 text-yellow-500" />
                                        {isHighlighted ? 'Remove Highlight' : 'Highlight Row'}
                                      </button>

                                      {/* Divider */}
                                      <div className="my-1 border-t border-slate-100" />

                                      {/* Delete Option */}
                                      <button
                                        onClick={() => {
                                          setDeletedIds(prev => [...prev, row._id]);
                                          setHighlightedRows(prev => prev.filter(id => id !== row._id));
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors duration-150"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete Log
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {getFilteredHistoryTransfers().filter(row => !deletedIds.includes(row._id)).length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-16 text-center text-slate-400 font-semibold text-sm">
                            No matching transfer history records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Dynamic Pagination */}
                {Math.ceil(getFilteredHistoryTransfers().filter(row => !deletedIds.includes(row._id)).length / ITEMS_PER_PAGE) > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-6 border-t border-slate-100">
                    {Array.from({ 
                      length: Math.ceil(getFilteredHistoryTransfers().filter(row => !deletedIds.includes(row._id)).length / ITEMS_PER_PAGE) 
                    }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = historyPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setHistoryPage(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center text-xs font-semibold rounded-lg border transition-colors duration-150 ${
                            isActive
                              ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Success Modal Overlay */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform scale-100 transition-transform p-6 space-y-6">
            {/* Header / Checkmark Icon */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-inner animate-bounce">
                <Check className="w-7 h-7 text-emerald-600 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Request Successfully Sent</h3>
                <p className="text-sm text-slate-500 mt-1">Transfer Request {successModal.transferNumber} has been successfully created</p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-y-2">
                <span className="font-semibold text-slate-400">Transfer No:</span>
                <span className="font-bold text-slate-800 text-right">{successModal.transferNumber}</span>

                <span className="font-semibold text-slate-400">From Warehouse:</span>
                <span className="font-bold text-slate-800 text-right">{successModal.source}</span>

                <span className="font-semibold text-slate-400">To Warehouse:</span>
                <span className="font-bold text-slate-800 text-right">{successModal.destination}</span>

                <span className="font-semibold text-slate-400">Requested Date:</span>
                <span className="font-bold text-slate-800 text-right">{successModal.requestedDate}</span>

                <span className="font-semibold text-slate-400">Priority:</span>
                <span className="font-bold text-slate-800 text-right uppercase tracking-wider flex items-center justify-end gap-1.5">
                  <span className={`w-2 h-2 rounded-full inline-block ${
                    successModal.priority === 'URGENT' ? 'bg-red-500' :
                    successModal.priority === 'HIGH' ? 'bg-amber-500' :
                    successModal.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-400'
                  }`} />
                  {successModal.priority}
                </span>

                <span className="font-semibold text-slate-400">Submitted At:</span>
                <span className="font-bold text-slate-800 text-right">{successModal.submittedAt}</span>
              </div>

              {/* Items Summary Table */}
              <div className="border-t border-slate-200/60 pt-3.5 mt-2 space-y-2.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transferring Items</span>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                  {successModal.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white border border-slate-150 rounded-xl p-2.5 shadow-sm text-xs font-semibold">
                      <div className="space-y-0.5">
                        <p className="text-slate-800 font-bold text-left">{item.name}</p>
                        <p className="text-slate-400 text-[10px] text-left">{item.sku}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg whitespace-nowrap">
                        Qty: {item.qty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {successModal.notes && (
                <div className="border-t border-slate-200/60 pt-3 mt-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase">Notes</span>
                  <p className="text-slate-600 text-xs italic mt-1 font-semibold text-left">"{successModal.notes}"</p>
                </div>
              )}
            </div>

            {/* Total summary + OK Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-400">Total Transfer Quantity</p>
                <p className="text-lg font-black text-slate-900">{successModal.totalQty} Items</p>
              </div>
              <button
                onClick={() => setSuccessModal(null)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-150"
              >
                Okay, Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
