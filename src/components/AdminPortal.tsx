import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  DollarSign,
  Package,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  RefreshCw,
  TrendingUp,
  FileText,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const AdminPortal: React.FC = () => {
  const {
    users,
    verifyFarmerStatus,
    transactions,
    products,
    orders,
    farms,
    currentUser,
    setSystemNotification,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'apiConsole'>('users');
  const [apiEndpoint, setApiEndpoint] = useState<string>('/api/products');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiRequestBody, setApiRequestBody] = useState<string>('{\n  "role": "farmer"\n}');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);

  // Financial aggregates
  const totalVolume = transactions.reduce((acc, t) => acc + t.grossAmount, 0);
  const totalFarmerDisbursed = transactions.reduce((acc, t) => acc + t.farmerPayout, 0);
  const totalLogisticsFees = transactions.reduce((acc, t) => acc + t.logisticsCommission, 0);
  const totalPlatformCommissions = transactions.reduce((acc, t) => acc + t.platformCommission, 0);

  const pendingFarmers = users.filter((u) => u.role === 'farmer' && u.verificationStatus === 'pending');
  const verifiedFarmers = users.filter((u) => u.role === 'farmer' && u.verificationStatus === 'verified');

  const handleTestApi = async () => {
    setIsLoadingApi(true);
    setApiResponse(null);
    setApiStatus(null);
    try {
      const options: RequestInit = {
        method: apiMethod,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token || 'jwt_admin_token_999'}`,
        },
      };

      if (apiMethod === 'POST') {
        options.body = apiRequestBody;
      }

      const res = await fetch(apiEndpoint, options);
      setApiStatus(res.status);
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
      setSystemNotification(`API [${apiMethod} ${apiEndpoint}] returned HTTP ${res.status}`);
    } catch (err: any) {
      setApiStatus(500);
      setApiResponse(
        JSON.stringify(
          {
            error: 'Failed to reach API server endpoint',
            details: err.message,
            hint: 'Verify that server.ts is running on port 3000.',
          },
          null,
          2
        )
      );
    } finally {
      setIsLoadingApi(false);
    }
  };

  return (
    <div className="space-y-6" id="admin-moderator-portal">
      {/* Header Banner */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 shadow-sm border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-800 text-emerald-400 border border-neutral-700">
              Platform Moderator
            </span>
            <span className="text-xs text-neutral-400 font-mono">Role: admin (Sarah Chen)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Admin &amp; Governance Center</h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Moderator controls for user role authorization, farmer credentials verification, platform transaction
            splits ledger, and REST API observability.
          </p>
        </div>

        {/* Aggregate KPI Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-neutral-800/80 px-3 py-2 rounded-xl border border-neutral-700">
            <div className="text-[10px] text-neutral-400 font-medium">Pending Farmers</div>
            <div className="text-base font-black text-amber-400">{pendingFarmers.length}</div>
          </div>
          <div className="bg-neutral-800/80 px-3 py-2 rounded-xl border border-neutral-700">
            <div className="text-[10px] text-neutral-400 font-medium">Gross Platform GMV</div>
            <div className="text-base font-black text-emerald-400">${totalVolume.toFixed(2)}</div>
          </div>
          <div className="bg-neutral-800/80 px-3 py-2 rounded-xl border border-neutral-700">
            <div className="text-[10px] text-neutral-400 font-medium">Platform 5% Net</div>
            <div className="text-base font-black text-white">${totalPlatformCommissions.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'users'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
          id="tab-admin-users"
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Roles &amp; Farmer Verification</span>
          {pendingFarmers.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-neutral-950 font-bold">
              {pendingFarmers.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'transactions'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
          id="tab-admin-transactions"
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Transactions &amp; Commission Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('apiConsole')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'apiConsole'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
          id="tab-admin-api"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Backend REST API Console</span>
        </button>
      </div>

      {/* TAB 1: User Roles & Farmer Verification */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Pending Verification Callout */}
          {pendingFarmers.length > 0 && (
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">
                      {pendingFarmers.length} Producer Account(s) Awaiting Certification Audit
                    </h4>
                    <p className="text-[11px] text-amber-700">
                      Review registered organic credentials and farm licenses to approve new growers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Individual pending review cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingFarmers.map((farmer) => {
                  const farm = farms.find((f) => f.id === farmer.farmId);
                  return (
                    <div
                      key={farmer.id}
                      className="p-3.5 bg-white border-2 border-amber-300 rounded-xl shadow-xs flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-neutral-900">{farmer.name}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                              Pending Audit
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-500">{farmer.email} · {farmer.phoneNumber || 'No phone'}</div>
                        </div>
                        <img
                          src={farmer.avatar || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=80&q=80'}
                          alt={farmer.name}
                          className="w-8 h-8 rounded-lg object-cover border border-amber-200"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="text-xs bg-neutral-50 p-2 rounded-lg border border-neutral-200 space-y-1">
                        <div className="font-semibold text-neutral-800">
                          🏡 Farm: {farm?.name || farmer.farmName || 'Pending Assignment'}
                        </div>
                        <div className="text-[11px] text-neutral-600">
                          📍 Location: {farm?.locationName || farmer.farmLocation || 'Unspecified'}
                        </div>
                        {farmer.certificationNumber && (
                          <div className="text-[11px] font-mono font-semibold text-emerald-700">
                            📜 Certification/License: #{farmer.certificationNumber}
                          </div>
                        )}
                        {farmer.primaryCrops && farmer.primaryCrops.length > 0 && (
                          <div className="text-[11px] text-neutral-600">
                            🌱 Crops: {farmer.primaryCrops.join(', ')} ({farmer.acreage || 'N/A'} acres)
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => verifyFarmerStatus(farmer.id, 'rejected')}
                          className="px-2.5 py-1 text-neutral-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => verifyFarmerStatus(farmer.id, 'verified')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                          id={`btn-approve-pending-${farmer.id}`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Authorize Farm</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-neutral-150 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">Users Table (Phase 2 Database Schema)</h3>
                <p className="text-xs text-neutral-500">
                  Role-Based Access Control: Farmers (producers), Consumers (buyers), and Admins (moderators)
                </p>
              </div>
              <span className="text-xs text-neutral-400 font-mono">Total records: {users.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Sign Up Profile &amp; Location</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {users.map((user) => {
                    const farm = farms.find((f) => f.id === user.farmId);
                    return (
                      <tr key={user.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80'}
                              alt={user.name}
                              className="w-7 h-7 rounded-full object-cover border border-neutral-200"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="font-bold text-neutral-900">{user.name}</div>
                              <div className="text-[11px] text-neutral-500 font-mono">{user.email}</div>
                              {user.phoneNumber && (
                                <div className="text-[10px] text-neutral-400">📞 {user.phoneNumber}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              user.role === 'farmer'
                                ? 'bg-emerald-100 text-emerald-800'
                                : user.role === 'admin'
                                ? 'bg-neutral-900 text-white'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {user.role === 'farmer' ? (
                            <div className="space-y-0.5">
                              <div className="font-semibold text-neutral-800">{farm ? farm.name : user.farmName || 'New Producer'}</div>
                              <div className="text-[10px] text-neutral-400">{farm ? farm.locationName : user.farmLocation || 'California'}</div>
                              {user.certificationNumber && (
                                <div className="text-[10px] font-mono text-emerald-700 font-semibold">
                                  Cert: #{user.certificationNumber}
                                </div>
                              )}
                              {user.primaryCrops && user.primaryCrops.length > 0 && (
                                <div className="text-[10px] text-neutral-500 truncate max-w-xs">
                                  Crops: {user.primaryCrops.join(', ')}
                                </div>
                              )}
                            </div>
                          ) : user.role === 'consumer' ? (
                            <div className="space-y-0.5">
                              <div className="font-medium text-neutral-800">
                                📦 {user.address ? `${user.address}, ${user.city || ''}` : 'Mission District, SF'}
                              </div>
                              <div className="text-[10px] text-neutral-400">
                                Payment: {user.preferredPaymentMethod || 'Stripe Escrow'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic">Platform Overseer</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {user.verificationStatus === 'verified' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          )}
                          {user.verificationStatus === 'pending' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 animate-pulse">
                              <Clock className="w-3 h-3" /> Pending Audit
                            </span>
                          )}
                          {user.verificationStatus === 'rejected' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              <XCircle className="w-3 h-3" /> Suspended
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-neutral-500">
                          {new Date(user.registeredAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {user.role === 'farmer' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {user.verificationStatus !== 'verified' && (
                                <button
                                  type="button"
                                  onClick={() => verifyFarmerStatus(user.id, 'verified')}
                                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-semibold transition-colors"
                                  id={`btn-verify-${user.id}`}
                                >
                                  Authorize Farm
                                </button>
                              )}
                              {user.verificationStatus === 'verified' && (
                                <button
                                  type="button"
                                  onClick={() => verifyFarmerStatus(user.id, 'rejected')}
                                  className="px-2 py-1 bg-neutral-100 hover:bg-rose-100 text-neutral-600 hover:text-rose-700 rounded-lg text-[11px] font-medium transition-colors"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-neutral-400 text-[11px]">System Managed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Transactions & Commission Ledger */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
              <span className="text-xs font-medium text-neutral-500">Total Purchase Volume</span>
              <div className="text-xl font-black text-neutral-900 mt-1">${totalVolume.toFixed(2)}</div>
              <span className="text-[11px] text-neutral-400">Gross Consumer Inflow</span>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl shadow-xs">
              <span className="text-xs font-semibold text-emerald-800">Producer Payouts (88%)</span>
              <div className="text-xl font-black text-emerald-700 mt-1">${totalFarmerDisbursed.toFixed(2)}</div>
              <span className="text-[11px] text-emerald-600">Disbursed to grower escrow</span>
            </div>

            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl shadow-xs">
              <span className="text-xs font-semibold text-purple-800">Logistics Allocation (7%)</span>
              <div className="text-xl font-black text-purple-700 mt-1">${totalLogisticsFees.toFixed(2)}</div>
              <span className="text-[11px] text-purple-600">Refrigerated route coverage</span>
            </div>

            <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl shadow-xs">
              <span className="text-xs font-semibold text-sky-800">Platform Maintenance (5%)</span>
              <div className="text-xl font-black text-sky-700 mt-1">${totalPlatformCommissions.toFixed(2)}</div>
              <span className="text-[11px] text-sky-600">Minimal server &amp; QA fees</span>
            </div>
          </div>

          {/* Transactions Ledger Table */}
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-neutral-150 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">
                  Transactions Table (Phase 2 Financial Schema)
                </h3>
                <p className="text-xs text-neutral-500">
                  Exact tracking of payment gateway events, producer escrow disbursements, and platform cuts
                </p>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {transactions.length} recorded events
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Buyer</th>
                    <th className="py-3 px-4">Recipient Farm</th>
                    <th className="py-3 px-4 text-right">Gross Total</th>
                    <th className="py-3 px-4 text-right">Farmer Net (88%)</th>
                    <th className="py-3 px-4 text-right">Logistics (7%)</th>
                    <th className="py-3 px-4 text-right">Platform (5%)</th>
                    <th className="py-3 px-4">Gateway</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-neutral-800">{txn.id}</td>
                      <td className="py-3 px-4 text-neutral-600">{txn.orderId}</td>
                      <td className="py-3 px-4 font-sans text-neutral-900">{txn.buyerName}</td>
                      <td className="py-3 px-4 font-sans text-emerald-800 font-medium">{txn.farmName}</td>
                      <td className="py-3 px-4 text-right font-bold text-neutral-900 font-sans">
                        ${txn.grossAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 font-sans">
                        ${txn.farmerPayout.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-purple-700 font-sans">
                        ${txn.logisticsCommission.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-sky-700 font-sans">
                        ${txn.platformCommission.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[10px] font-semibold">
                          {txn.paymentGateway}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          {txn.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Backend REST API Console (Phase 3 Backend API Development) */}
      {activeTab === 'apiConsole' && (
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Phase 3: Backend REST API Interactive Console
                </h3>
                <p className="text-xs text-neutral-500">
                  Direct client-to-server HTTP testing against the Express server.ts backend endpoints
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setApiMethod('GET');
                    setApiEndpoint('/api/products');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono text-[11px]"
                >
                  GET /api/products
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setApiMethod('GET');
                    setApiEndpoint('/api/users');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono text-[11px]"
                >
                  GET /api/users
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setApiMethod('GET');
                    setApiEndpoint('/api/transactions');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono text-[11px]"
                >
                  GET /api/transactions
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setApiMethod('GET');
                    setApiEndpoint('/api/orders');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono text-[11px]"
                >
                  GET /api/orders
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setApiMethod('GET');
                    setApiEndpoint('/api/logistics/optimize');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono text-[11px]"
                >
                  GET /api/logistics/optimize
                </button>
              </div>
            </div>

            {/* Request Bar */}
            <div className="flex items-center gap-2">
              <select
                value={apiMethod}
                onChange={(e) => setApiMethod(e.target.value as 'GET' | 'POST')}
                className="px-3 py-2 text-xs font-bold bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-800 focus:outline-hidden"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>

              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                placeholder="/api/products"
                className="flex-1 px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-800 focus:outline-hidden"
              />

              <button
                type="button"
                onClick={handleTestApi}
                disabled={isLoadingApi}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                id="btn-execute-api-call"
              >
                {isLoadingApi ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send Request</span>
              </button>
            </div>

            {/* If POST, allow payload */}
            {apiMethod === 'POST' && (
              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  JSON Request Payload
                </label>
                <textarea
                  rows={4}
                  value={apiRequestBody}
                  onChange={(e) => setApiRequestBody(e.target.value)}
                  className="w-full font-mono text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-800"
                />
              </div>
            )}
          </div>

          {/* Response Output Console */}
          <div className="bg-neutral-950 text-neutral-100 border border-neutral-800 rounded-2xl p-4 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-neutral-400">Response Payload Inspector</span>
              </div>
              {apiStatus !== null && (
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    apiStatus === 200 || apiStatus === 201
                      ? 'bg-emerald-900 text-emerald-300'
                      : 'bg-rose-900 text-rose-300'
                  }`}
                >
                  HTTP {apiStatus}
                </span>
              )}
            </div>

            <pre className="overflow-x-auto max-h-96 text-[11px] text-emerald-300 leading-relaxed">
              {apiResponse
                ? apiResponse
                : '// Click "Send Request" to test server API response.\n// Endpoints are powered by Express /server.ts on Port 3000.'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
