import React, { useState } from 'react';
import {
  Sprout,
  DollarSign,
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Truck,
  ArrowUpRight,
  Sparkles,
  Layers,
  Printer,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product, OrderStatus, ShippingLabelData } from '../types';
import { PricingBreakdown } from './PricingBreakdown';
import { ShippingLabelModal } from './ShippingLabelModal';

export const FarmerPortal: React.FC = () => {
  const {
    farms,
    activeFarmId,
    setActiveFarmId,
    activeFarm,
    products,
    updateProductStock,
    updateProductPrice,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    payoutRecords,
    updateOrderStatus,
    acceptOrder,
    markOrderDelivered,
    getShippingLabelData,
    currentUser,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'payouts'>('inventory');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrderFilter, setSelectedOrderFilter] = useState<'all' | 'Pending' | 'Dispatched' | 'Delivered'>('all');
  const [activeShippingLabel, setActiveShippingLabel] = useState<ShippingLabelData | null>(null);

  // New Produce Form State
  const [newProduceName, setNewProduceName] = useState('');
  const [newProduceCategory, setNewProduceCategory] = useState<Product['category']>('Vegetables');
  const [newProduceDesc, setNewProduceDesc] = useState('');
  const [newProducePrice, setNewProducePrice] = useState('4.50');
  const [newProduceUnit, setNewProduceUnit] = useState('lb');
  const [newProduceStock, setNewProduceStock] = useState('40');
  const [newProduceHarvest, setNewProduceHarvest] = useState('Harvested at 6:00 AM');
  const [newProduceLocation, setNewProduceLocation] = useState('Sonoma County, CA');
  const [newProduceImage, setNewProduceImage] = useState(
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=600&q=80'
  );
  const [newProduceOrganic, setNewProduceOrganic] = useState(true);

  if (!activeFarm) return null;

  // Filter products for active farm
  const farmProducts = products.filter((p) => p.farmId === activeFarm.id);

  // Filter orders containing items for this farm
  const farmOrders = orders.filter((o) => o.items.some((item) => item.farmId === activeFarm.id));

  // Filter payout records for this farm
  const farmPayouts = payoutRecords.filter((p) => p.farmId === activeFarm.id);

  const totalFarmGross = farmPayouts.reduce((acc, p) => acc + p.grossAmount, 0);
  const totalFarmNet = farmPayouts.reduce((acc, p) => acc + p.farmerNetPayout, 0);

  const handleAddProduceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduceName.trim()) return;

    addProduct({
      name: newProduceName.trim(),
      category: newProduceCategory,
      description: newProduceDesc.trim() || 'Farm fresh organic produce harvested locally.',
      pricePerUnit: parseFloat(newProducePrice) || 3.5,
      unit: newProduceUnit.trim() || 'lb',
      stockQuantity: parseInt(newProduceStock, 10) || 20,
      harvestDate: newProduceHarvest.trim() || 'Today',
      location: newProduceLocation.trim() || activeFarm.locationName,
      imageUrl: newProduceImage.trim(),
      organic: newProduceOrganic,
      farmerSharePercentage: 88,
      logisticsSharePercentage: 7,
      platformSharePercentage: 5,
    });

    setIsAddModalOpen(false);
    setNewProduceName('');
    setNewProduceDesc('');
  };

  const handleEditProduceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProduct(editingProduct.id, {
      name: editingProduct.name,
      pricePerUnit: editingProduct.pricePerUnit,
      unit: editingProduct.unit,
      stockQuantity: editingProduct.stockQuantity,
      description: editingProduct.description,
      harvestDate: editingProduct.harvestDate,
      organic: editingProduct.organic,
    });

    setEditingProduct(null);
  };

  return (
    <div className="space-y-6" id="farmer-portal-app">
      {/* Producer Header & Farm Switcher */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={activeFarm.avatar}
              alt={activeFarm.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-neutral-900">{activeFarm.name}</h2>
                {activeFarm.certifiedOrganic && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Certified Organic
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                📍 {activeFarm.locationName} · Lat: {activeFarm.coordinates[0].toFixed(3)}, Lng:{' '}
                {activeFarm.coordinates[1].toFixed(3)}
              </p>
              <p className="text-xs text-neutral-600 mt-1 max-w-xl line-clamp-1">{activeFarm.bio}</p>
            </div>
          </div>

          {/* Farm Switcher Dropdown */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-neutral-400 font-semibold uppercase">Switch Registered Farm:</div>
              <select
                value={activeFarmId}
                onChange={(e) => setActiveFarmId(e.target.value)}
                className="mt-1 px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                id="select-switch-farm"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.locationName.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Farmer Economic KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-neutral-150">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Net Producer Earnings</span>
            </div>
            <div className="text-lg font-bold text-emerald-950 mt-1">
              ${activeFarm.totalEarnings.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              88.0% take-home margin
            </div>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
              <Package className="w-4 h-4 text-neutral-500" />
              <span>Active Catalog Items</span>
            </div>
            <div className="text-lg font-bold text-neutral-900 mt-1">{farmProducts.length} Items</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Real-time inventory linked</div>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
              <Truck className="w-4 h-4 text-neutral-500" />
              <span>Pending Farm Pickups</span>
            </div>
            <div className="text-lg font-bold text-neutral-900 mt-1">
              {farmOrders.filter((o) => o.status !== 'delivered').length} Orders
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Batched for refrigerated van</div>
          </div>

          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-sky-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Direct Sale Premium</span>
            </div>
            <div className="text-lg font-bold text-sky-950 mt-1">+73% vs Retail</div>
            <div className="text-[11px] text-sky-700 mt-0.5">Supermarkets retain ~85%</div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center justify-between border-b border-neutral-200">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            id="tab-farmer-inventory"
          >
            <Package className="w-4 h-4" />
            Produce &amp; Inventory ({farmProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            id="tab-farmer-orders"
          >
            <Truck className="w-4 h-4" />
            Incoming Orders &amp; Pickups ({farmOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'payouts'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            id="tab-farmer-payouts"
          >
            <DollarSign className="w-4 h-4" />
            Transparent Payout Ledger ({farmPayouts.length})
          </button>
        </div>

        {activeTab === 'inventory' && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors mb-2"
            id="btn-add-produce-modal"
          >
            <Plus className="w-3.5 h-3.5" />
            List New Produce
          </button>
        )}
      </div>

      {/* TAB 1: Real-time Inventory & Produce Management */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">Real-Time Inventory Synchronization:</span> Any change to unit stock or
              prices here immediately propagates to the Consumer/Buyer App via the central marketplace state. Try
              adjusting stock or price below and check the buyer view!
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                    <th className="py-3 px-4">Produce Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Unit Price</th>
                    <th className="py-3 px-4">Farmer Share (88%)</th>
                    <th className="py-3 px-4">Central Stock (Live)</th>
                    <th className="py-3 px-4">Harvest Timestamp</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-150">
                  {farmProducts.map((prod) => {
                    const farmerShare = Math.round(prod.pricePerUnit * 0.88 * 100) / 100;
                    const isOutOfStock = prod.stockQuantity <= 0;

                    return (
                      <tr key={prod.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-10 h-10 rounded-lg object-cover border border-neutral-200 flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="font-bold text-neutral-900">{prod.name}</div>
                              <div className="text-[11px] text-neutral-500 line-clamp-1">{prod.description}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-neutral-100 rounded-md text-[11px] font-medium text-neutral-700">
                            {prod.category}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-neutral-500">$</span>
                            <input
                              type="number"
                              step="0.25"
                              min="0.5"
                              value={prod.pricePerUnit}
                              onChange={(e) =>
                                updateProductPrice(prod.id, parseFloat(e.target.value) || prod.pricePerUnit)
                              }
                              className="w-16 px-1.5 py-1 text-xs border border-neutral-200 rounded font-semibold text-neutral-900 focus:ring-1 focus:ring-emerald-500"
                            />
                            <span className="text-neutral-400 text-[11px]">/{prod.unit}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-emerald-700">${farmerShare.toFixed(2)}</div>
                          <div className="text-[10px] text-neutral-400">88% take-home</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateProductStock(prod.id, prod.stockQuantity - 5)}
                              className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold"
                              title="Decrease 5"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={prod.stockQuantity}
                              onChange={(e) =>
                                updateProductStock(prod.id, parseInt(e.target.value, 10) || 0)
                              }
                              className={`w-14 px-1.5 py-1 text-center font-bold rounded border ${
                                isOutOfStock
                                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                                  : 'bg-emerald-50/50 border-emerald-300 text-emerald-900'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => updateProductStock(prod.id, prod.stockQuantity + 5)}
                              className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold"
                              title="Add 5"
                            >
                              +
                            </button>
                          </div>
                          {isOutOfStock && (
                            <span className="text-[10px] font-semibold text-rose-600">Out of Stock</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-neutral-600">{prod.harvestDate}</td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingProduct(prod)}
                              className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg"
                              title="Edit Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProduct(prod.id)}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Remove Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* TAB 2: Orders and Pickups */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Orders Allocated to {activeFarm.name}
              </h3>
              <span className="text-xs text-neutral-500">
                Pickups are grouped automatically into regional cold-chain routes
              </span>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs">
              {(['all', 'Pending', 'Dispatched', 'Delivered'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedOrderFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                    selectedOrderFilter === filter
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {farmOrders.length === 0 ? (
            <div className="p-8 text-center bg-white border border-neutral-200 rounded-xl text-neutral-500">
              No orders yet for this farm. Use the Buyer App or click "Run Simulated Batch Order" to test!
            </div>
          ) : (
            <div className="space-y-3">
              {farmOrders
                .filter((order) => {
                  if (selectedOrderFilter === 'all') return true;
                  if (selectedOrderFilter === 'Pending') {
                    return order.status === 'Pending' || order.status === 'order_placed';
                  }
                  if (selectedOrderFilter === 'Dispatched') {
                    return (
                      order.status === 'Dispatched' ||
                      order.status === 'batch_consolidated' ||
                      order.status === 'farm_pickup' ||
                      order.status === 'hub_sorting' ||
                      order.status === 'out_for_delivery'
                    );
                  }
                  if (selectedOrderFilter === 'Delivered') {
                    return order.status === 'Delivered' || order.status === 'delivered';
                  }
                  return true;
                })
                .map((order) => {
                  const farmItems = order.items.filter((item) => item.farmId === activeFarm.id);
                  const orderFarmPayout = farmItems.reduce((acc, i) => acc + i.farmerPayout, 0);
                  const isPending = order.status === 'Pending' || order.status === 'order_placed';
                  const isDelivered = order.status === 'Delivered' || order.status === 'delivered';

                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                      id={`farmer-order-${order.id}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 text-sm font-mono">{order.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPending
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : isDelivered
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-sky-100 text-sky-800 border border-sky-300'
                            }`}
                          >
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-neutral-400">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1">
                          {farmItems.map((item, idx) => (
                            <div key={idx} className="text-xs text-neutral-700 flex items-center gap-2">
                              <span className="font-semibold text-emerald-800">
                                {item.quantity}x {item.productName}
                              </span>
                              <span className="text-neutral-400">
                                (${item.unitPrice.toFixed(2)}/{item.unit})
                              </span>
                              <span className="text-emerald-700 font-bold">
                                → Payout: ${item.farmerPayout.toFixed(2)} (88%)
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="text-[11px] text-neutral-500 mt-2">
                          Buyer: <span className="font-semibold text-neutral-700">{order.buyerName}</span> · Dropoff: {order.buyerAddress.split(',')[0]}
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-2.5">
                        <div className="text-right">
                          <div className="text-xs text-neutral-400">Your Net Payout:</div>
                          <div className="text-base font-black text-emerald-700">
                            ${orderFarmPayout.toFixed(2)}
                          </div>
                        </div>

                        {/* Order & Shipping Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Print Shipping Label button */}
                          <button
                            type="button"
                            onClick={() => {
                              const label = getShippingLabelData(order.id);
                              setActiveShippingLabel(label);
                            }}
                            className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1 border border-neutral-300 transition-colors"
                            title="Generate thermal cold-chain shipping barcode label"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{order.shippingLabelPrinted ? 'Re-print Label' : 'Print Label'}</span>
                          </button>

                          {/* Accept and Dispatch */}
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => acceptOrder(order.id)}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                              id={`btn-accept-dispatch-${order.id}`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept &amp; Dispatch</span>
                            </button>
                          )}

                          {!isPending && !isDelivered && (
                            <button
                              type="button"
                              onClick={() => markOrderDelivered(order.id)}
                              className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                              id={`btn-mark-delivered-${order.id}`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Confirm Delivered</span>
                            </button>
                          )}

                          {isDelivered && (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Delivered &amp; Settled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Transparent Payout Ledger (Verification 2) */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-emerald-950 text-sm">
                  Verified 88% Direct Payout Settlement Ledger
                </h4>
              </div>
              <p className="text-xs text-emerald-800 mt-1 max-w-xl">
                Every sale mathematically allocates 88% net to your farm account, 7% to regional cold-chain routing,
                and 5% to technology maintenance. Funds settle instantly on consumer purchase.
              </p>
            </div>
            <div className="text-right bg-white px-4 py-2.5 rounded-xl border border-emerald-200 shadow-xs">
              <div className="text-[11px] text-neutral-500 font-semibold uppercase">Total Settled Balance</div>
              <div className="text-xl font-black text-emerald-700">${activeFarm.totalEarnings.toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                    <th className="py-3 px-4">Transaction / Date</th>
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Produce Sold</th>
                    <th className="py-3 px-4">Gross Sale</th>
                    <th className="py-3 px-4">Farmer Share (88%)</th>
                    <th className="py-3 px-4">Logistics (7%)</th>
                    <th className="py-3 px-4">Platform (5%)</th>
                    <th className="py-3 px-4 text-right">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-150">
                  {farmPayouts.map((record) => {
                    const logisticsAmt = Math.round(record.grossAmount * 0.07 * 100) / 100;
                    const platformAmt = Math.round(record.grossAmount * 0.05 * 100) / 100;

                    return (
                      <tr key={record.id} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-neutral-900">{record.id}</div>
                          <div className="text-[10px] text-neutral-400">
                            {new Date(record.timestamp).toLocaleDateString()} ·{' '}
                            {new Date(record.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-neutral-700">{record.orderId}</td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-neutral-800">
                            {record.quantity}x {record.productName}
                          </div>
                          <div className="text-[10px] text-neutral-400">({record.unit})</div>
                        </td>

                        <td className="py-3 px-4 font-bold text-neutral-900">${record.grossAmount.toFixed(2)}</td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-emerald-700 text-sm">
                            ${record.farmerNetPayout.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-emerald-800 ml-1 font-semibold">(88%)</span>
                        </td>

                        <td className="py-3 px-4 text-neutral-600">${logisticsAmt.toFixed(2)}</td>

                        <td className="py-3 px-4 text-neutral-600">${platformAmt.toFixed(2)}</td>

                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Settled
                          </span>
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

      {/* Add Produce Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-neutral-900 mb-1">List New Produce Item</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Adding produce for {activeFarm.name}. Automatically enrolled in 88% direct farmer economics.
            </p>

            <form onSubmit={handleAddProduceSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Produce Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crisp Asian Pears"
                  value={newProduceName}
                  onChange={(e) => setNewProduceName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Category</label>
                  <select
                    value={newProduceCategory}
                    onChange={(e) => setNewProduceCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy & Eggs">Dairy &amp; Eggs</option>
                    <option value="Greens & Herbs">Greens &amp; Herbs</option>
                    <option value="Honey & Pantry">Honey &amp; Pantry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Unit Type</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. lb, bunch, dozen, 8oz jar"
                    value={newProduceUnit}
                    onChange={(e) => setNewProduceUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Price per Unit ($)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.5"
                    required
                    value={newProducePrice}
                    onChange={(e) => setNewProducePrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                    You keep: ${(parseFloat(newProducePrice || '0') * 0.88).toFixed(2)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProduceStock}
                    onChange={(e) => setNewProduceStock(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Harvest Timestamp</label>
                  <input
                    type="text"
                    value={newProduceHarvest}
                    onChange={(e) => setNewProduceHarvest(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Harvest Location (Origin)</label>
                  <input
                    type="text"
                    value={newProduceLocation}
                    onChange={(e) => setNewProduceLocation(e.target.value)}
                    placeholder="e.g. Sonoma Valley, CA"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newProduceDesc}
                  onChange={(e) => setNewProduceDesc(e.target.value)}
                  placeholder="Notes on varieties, harvesting methods, flavor profile..."
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-organic"
                  checked={newProduceOrganic}
                  onChange={(e) => setNewProduceOrganic(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="chk-organic" className="text-xs text-neutral-700 font-medium">
                  Certified Organic / Pesticide-Free
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Publish to Central Marketplace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Produce Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-neutral-900 mb-1">Edit Produce Listing</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Changes sync instantly to the consumer shopping catalog.
            </p>

            <form onSubmit={handleEditProduceSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Produce Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Price per Unit ($)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.5"
                    required
                    value={editingProduct.pricePerUnit}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, pricePerUnit: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Live Inventory</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.stockQuantity}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stockQuantity: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipping Label Thermal Print Modal */}
      <ShippingLabelModal
        labelData={activeShippingLabel}
        onClose={() => setActiveShippingLabel(null)}
      />
    </div>
  );
};
