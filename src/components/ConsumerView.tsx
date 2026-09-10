import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  X,
  Plus,
  Minus,
  Truck,
  CreditCard,
  Printer,
  Package,
  User,
  Flag,
  RotateCcw,
  Compass,
  Navigation,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product, ShippingLabelData } from '../types';
import { PricingBreakdown } from './PricingBreakdown';
import { ShippingLabelModal } from './ShippingLabelModal';
import { FocusedDeliveryMap } from './FocusedDeliveryMap';
import { UserProfileModal } from './UserProfileModal';
import { ReportIssueModal } from './ReportIssueModal';

export const ConsumerView: React.FC = () => {
  const {
    products,
    farms,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartBreakdown,
    checkoutCart,
    orders,
    getShippingLabelData,
    currentUser,
  } = useMarketplace();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFarmId, setSelectedFarmId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [activeShippingLabel, setActiveShippingLabel] = useState<ShippingLabelData | null>(null);

  // Profile & Reporting modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTargetOrderId, setReportTargetOrderId] = useState<string | undefined>(undefined);

  // Checkout form fields (synced with logged-in user profile)
  const [buyerName, setBuyerName] = useState(currentUser?.name || 'Elena Rostova');
  const [buyerAddress, setBuyerAddress] = useState(
    currentUser?.address
      ? `${currentUser.address}${currentUser.city ? `, ${currentUser.city}` : ''}${
          currentUser.zipCode ? ` ${currentUser.zipCode}` : ''
        }`
      : 'Flat 402, Green Meadows, Koregaon Park, Pune, MH 411001'
  );
  const [buyerCoords, setBuyerCoords] = useState<[number, number]>([18.5362, 73.894]);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<'Morning (7 AM - 10 AM)' | 'Afternoon (12 PM - 3 PM)' | 'Evening (5 PM - 8 PM)'>('Morning (7 AM - 10 AM)');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentGateway, setPaymentGateway] = useState<'CashOnDelivery' | 'UPI' | 'Card'>('CashOnDelivery');
  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState<any | null>(null);

  useEffect(() => {
    if (currentUser) {
      setBuyerName(currentUser.name);
      if (currentUser.address) {
        setBuyerAddress(
          `${currentUser.address}${currentUser.city ? `, ${currentUser.city}` : ''}${
            currentUser.zipCode ? ` ${currentUser.zipCode}` : ''
          }`
        );
      }
    }
  }, [currentUser]);

  const categories = ['All', 'Vegetables', 'Fruits', 'Dairy & Eggs', 'Greens & Herbs', 'Honey & Pantry'];

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesFarm = selectedFarmId === 'all' || prod.farmId === selectedFarmId;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.farmName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesFarm && matchesSearch;
  });

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartBreakdown = getCartBreakdown();

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    const newOrder = checkoutCart(
      buyerName,
      buyerAddress,
      buyerCoords,
      paymentGateway === 'CashOnDelivery'
        ? 'Pay on Delivery'
        : paymentGateway === 'UPI'
        ? 'UPI Instant (GPay/PhonePe)'
        : 'Credit/Debit Card'
    );
    setCheckoutSuccessOrder(newOrder);
    // Order-Triggered Activation: immediately activate live delivery tracking for this new order
    setActiveTrackingOrderId(newOrder.id);
    setIsCheckoutModalOpen(false);
    setIsCartOpen(false);
  };

  // Active tracking order is ONLY resolved when triggered by an active order or tracking request
  const activeTrackingOrder = useMemo(() => {
    if (!activeTrackingOrderId) return null;
    return (
      orders.find((o) => o.id === activeTrackingOrderId) ||
      (checkoutSuccessOrder?.id === activeTrackingOrderId ? checkoutSuccessOrder : null)
    );
  }, [activeTrackingOrderId, orders, checkoutSuccessOrder]);

  // Order-Triggered: Find if the customer has an active in-progress order
  const customerActiveOrder = useMemo(() => {
    if (checkoutSuccessOrder) return checkoutSuccessOrder;
    return (
      orders.find(
        (o) =>
          (o.buyerName.toLowerCase().includes(currentUser?.name.toLowerCase() || '') ||
            o.buyerAddress.toLowerCase().includes(currentUser?.address?.toLowerCase() || '')) &&
          o.status !== 'delivered' &&
          o.status !== 'cancelled'
      ) || (orders.length > 0 && orders[0].status === 'out_for_delivery' ? orders[0] : null)
    );
  }, [orders, checkoutSuccessOrder, currentUser]);

  return (
    <div className="space-y-6" id="consumer-buyer-app">
      {/* Top Banner & Value Proposition */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Direct Farm-to-Consumer Ecosystem</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Fresh Local Harvest, Honest Direct Economics
          </h2>
          <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
            Order directly from regional family farms with total economic transparency: <strong>88% of your payment</strong> goes directly into the farmer's pocket, while refrigerated smart-batch routing brings dawn-harvested produce right to your door.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-emerald-200 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> 88% Direct Farmer Payout
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> FPO Lab Certified Organic
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Doorstep Cold-Chain Delivery
            </span>
          </div>
        </div>

        {/* Quick Customer Action Buttons */}
        <div className="relative z-10 mt-5 pt-4 border-t border-emerald-600/60 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 border border-white/20 transition-colors"
            id="btn-customer-profile-open"
          >
            <User className="w-3.5 h-3.5" />
            <span>My Profile</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setReportTargetOrderId(undefined);
              setIsReportModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 border border-white/20 transition-colors"
            id="btn-customer-report-issue"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report an Issue</span>
          </button>
        </div>

        {/* Decorative background accent */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none flex items-center justify-center">
          <span className="text-[140px]">🧺</span>
        </div>
      </div>

      {/* Order-Triggered Activation: Only displays when customer has an active order */}
      {customerActiveOrder && (
        <div
          className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200"
          id="order-triggered-delivery-banner"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  Active Order #{customerActiveOrder.id}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 uppercase">
                  {customerActiveOrder.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Electric cold-chain van en route to{' '}
                <strong>
                  {customerActiveOrder.buyerAddress
                    ? customerActiveOrder.buyerAddress.split(',')[0]
                    : 'your doorstep'}
                </strong>{' '}
                · ETA: <strong>{customerActiveOrder.deliveryEta || '22 Mins'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTrackingOrderId(customerActiveOrder.id)}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              id="btn-track-active-order-map"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Track Live Delivery Map</span>
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search mangoes, organic spinach, honey..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            id="input-consumer-search"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Farm Filter Dropdown */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <select
            value={selectedFarmId}
            onChange={(e) => setSelectedFarmId(e.target.value)}
            className="w-full md:w-auto px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            id="select-farm-filter"
          >
            <option value="all">All Member Farms</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.locationName ? f.locationName.split(',')[0] : 'Local'})
              </option>
            ))}
          </select>

          {/* Floating / Inline Cart Button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors flex-shrink-0"
            id="btn-open-cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            {cartItemCount > 0 && (
              <span className="bg-emerald-500 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Success Order Alert Banner if just completed */}
      {checkoutSuccessOrder && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-start justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                Order Confirmed! Reference #{checkoutSuccessOrder.id}
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Central database synchronized. Stock decremented across {checkoutSuccessOrder.items.length} farm items, and{' '}
                <strong>₹{checkoutSuccessOrder.totalFarmerPayout.toFixed(2)} (88%)</strong> was credited to registered
                farmer bank accounts.
              </p>
              <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTrackingOrderId(checkoutSuccessOrder.id);
                    setCheckoutSuccessOrder(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg shadow-2xs"
                >
                  <Truck className="w-3.5 h-3.5" /> Track Focused Delivery
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReportTargetOrderId(checkoutSuccessOrder.id);
                    setIsReportModalOpen(true);
                  }}
                  className="text-xs text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  Need Help with this Order?
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutSuccessOrder(null)}
                  className="text-xs text-emerald-600 hover:text-emerald-800 ml-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => {
          const farm = farms.find((f) => f.id === product.farmId);
          const isOutOfStock = product.stockQuantity <= 0;
          const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
          const inCartItem = cart.find((i) => i.product.id === product.id);

          return (
            <div
              key={product.id}
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group"
              id={`product-card-${product.id}`}
            >
              {/* Product Image & Badges */}
              <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                  {product.organic && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                      Organic
                    </span>
                  )}
                  {product.verificationStatus === 'verified' && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white shadow-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> FPO Grade A+
                    </span>
                  )}
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 text-neutral-800 backdrop-blur-xs shadow-xs">
                    {product.distanceMiles} km from hub
                  </span>
                </div>

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-2xs flex items-center justify-center">
                    <span className="px-3 py-1 bg-white text-neutral-900 font-bold text-xs rounded-lg shadow-sm">
                      Harvest Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                    <span className="font-semibold text-emerald-800 truncate">{product.farmName}</span>
                    <span className="flex items-center gap-1 flex-shrink-0 text-neutral-400 text-[11px]">
                      <MapPin className="w-3 h-3" /> {product.location ? product.location.split(',')[0] : 'Regional Farm'}
                    </span>
                  </div>

                  <h3 className="font-bold text-neutral-900 text-base leading-tight mb-1">{product.name}</h3>

                  <p className="text-neutral-500 text-xs line-clamp-2 leading-relaxed mb-3">
                    {product.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-neutral-150">
                  {/* Price and Farmer share banner */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-black text-neutral-900">
                        ₹{product.pricePerUnit.toFixed(2)}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium ml-1">/ {product.unit}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setInspectingProduct(product)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline"
                    >
                      View Breakdown
                    </button>
                  </div>

                  {/* Compact Automated Breakdown Bar */}
                  <PricingBreakdown price={product.pricePerUnit} compact={true} />

                  {/* Add to Cart Actions */}
                  <div className="pt-1">
                    {isOutOfStock ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2 bg-neutral-100 text-neutral-400 rounded-xl text-xs font-medium cursor-not-allowed"
                      >
                        Item Sold Out
                      </button>
                    ) : inCartItem ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, inCartItem.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-white border border-emerald-200 text-emerald-800 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-emerald-950">
                          {inCartItem.quantity} in Cart
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, inCartItem.quantity + 1)}
                          disabled={inCartItem.quantity >= product.stockQuantity}
                          className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center hover:bg-emerald-800 disabled:opacity-40 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(product, 1)}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                        id={`btn-add-cart-${product.id}`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Add to Direct Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Detail Modal */}
      {inspectingProduct && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setInspectingProduct(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={inspectingProduct.imageUrl}
                  alt={inspectingProduct.name}
                  className="w-full h-56 object-cover rounded-xl border border-neutral-200"
                  referrerPolicy="no-referrer"
                />
                <div className="mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Farm Producer:</span>
                    <strong className="text-neutral-800">{inspectingProduct.farmName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Harvest Date:</span>
                    <span>{inspectingProduct.harvestDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Available Stock:</span>
                    <span className="font-semibold text-emerald-700">{inspectingProduct.stockQuantity} {inspectingProduct.unit}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    {inspectingProduct.category}
                  </span>
                  <h3 className="text-xl font-bold text-neutral-900 mt-0.5">{inspectingProduct.name}</h3>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">{inspectingProduct.description}</p>
                </div>

                <div className="mt-4">
                  <PricingBreakdown price={inspectingProduct.pricePerUnit} />
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-neutral-900">
                      ₹{inspectingProduct.pricePerUnit.toFixed(2)}
                    </span>
                    <span className="text-xs text-neutral-500 ml-1">/ {inspectingProduct.unit}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      addToCart(inspectingProduct, 1);
                      setInspectingProduct(null);
                    }}
                    disabled={inspectingProduct.stockQuantity <= 0}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-neutral-900 text-base">Direct Produce Cart</h3>
                <span className="text-xs text-neutral-500 font-medium">({cartItemCount} items)</span>
              </div>
              <div className="flex items-center gap-1">
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[11px] text-neutral-500 hover:text-rose-600 px-2 py-1"
                    title="Empty Cart"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-neutral-400 text-center">
                  <ShoppingBag className="w-12 h-12 stroke-1 mb-2 text-neutral-300" />
                  <p className="text-sm font-medium text-neutral-600">Your direct cart is empty</p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                    Explore fresh harvest items directly from Nashik, Pune, and Konkan regional farms.
                  </p>
                </div>
              ) : (
                cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="p-3 border border-neutral-200 rounded-xl bg-neutral-50/50 flex gap-3 items-center"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-lg border border-neutral-200 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-emerald-700 font-semibold truncate">{product.farmName}</div>
                      <h4 className="text-xs font-bold text-neutral-900 truncate">{product.name}</h4>
                      <div className="text-xs font-bold text-neutral-800 mt-0.5">
                        ₹{(product.pricePerUnit * quantity).toFixed(2)}
                        <span className="text-[10px] font-normal text-neutral-500 ml-1">
                          (₹{product.pricePerUnit.toFixed(2)} / {product.unit})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(product.id, quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-md"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-1.5 text-neutral-800">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stockQuantity}
                        className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-md disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer with Full Transparent Breakdown */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-neutral-200 bg-white space-y-3">
                <PricingBreakdown price={getCartTotal()} compact={false} />

                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-colors"
                  id="btn-proceed-to-checkout"
                >
                  <span>Proceed to Direct Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Checkout Modal (Streamlined with Pay-on-Delivery, UPI, and zero upfront friction) */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setIsCheckoutModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-base">Direct Consumer Checkout</h3>
                <p className="text-xs text-neutral-500">
                  Direct harvest allocation with 88% farmer take-home guarantee
                </p>
              </div>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Delivery Destination (Doorstep Address)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  {/* Quick regional destination presets */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="text-neutral-400 py-0.5">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setBuyerAddress('Flat 402, Green Meadows, Koregaon Park, Pune, MH 411001');
                        setBuyerCoords([18.5362, 73.894]);
                      }}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700"
                    >
                      Pune Koregaon
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBuyerAddress('12A, Sea View Apts, Bandra West, Mumbai, MH 400050');
                        setBuyerCoords([19.0596, 72.8295]);
                      }}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700"
                    >
                      Mumbai Bandra
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBuyerAddress('Plot 18, Gangapur Road, Anandwalli, Nashik, MH 422013');
                        setBuyerCoords([19.9975, 73.7898]);
                      }}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700"
                    >
                      Nashik Gangapur
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Time Slot */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Preferred Delivery Slot
                </label>
                <select
                  value={deliveryTimeSlot}
                  onChange={(e) => setDeliveryTimeSlot(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Morning (7 AM - 10 AM)">Morning (7 AM - 10 AM) - Dawn Harvest Fresh</option>
                  <option value="Afternoon (12 PM - 3 PM)">Afternoon (12 PM - 3 PM)</option>
                  <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                </select>
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Delivery Notes / Gate Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leave with building security, call upon arrival"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Streamlined Payment Options (No upfront blockage) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Payment Method (Pay On Arrival or Instant)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CashOnDelivery', label: 'Pay on Delivery', desc: 'Cash / UPI at doorstep' },
                    { id: 'UPI', label: 'Instant UPI', desc: 'GPay, PhonePe, Paytm' },
                    { id: 'Card', label: 'Debit / Credit', desc: 'RuPay, Visa, Master' },
                  ].map((gateway) => (
                    <button
                      key={gateway.id}
                      type="button"
                      onClick={() => setPaymentGateway(gateway.id as any)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        paymentGateway === gateway.id
                          ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-neutral-900">{gateway.label}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">{gateway.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Economic Settlement Confirmation */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-neutral-600">Total Produce Cost:</span>
                  <span className="font-bold text-neutral-900">₹{cartBreakdown.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Direct Farmer Payout (88%):</span>
                  <span>₹{cartBreakdown.farmerAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Refrigerated Last-Mile Hub Routing (7%):</span>
                  <span>₹{cartBreakdown.logisticsAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Platform Operations (5%):</span>
                  <span>₹{cartBreakdown.platformAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  id="btn-confirm-order-submit"
                >
                  <CheckCircle2 className="w-4 h-4" /> Place Verified Order &amp; Allocate Payouts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Tracking Modal with Focused Delivery Map */}
      {activeTrackingOrder && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setActiveTrackingOrderId(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between mb-3 pr-6">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-neutral-900 text-base">
                  Focused Delivery Map · Order {activeTrackingOrder.id}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 uppercase">
                {activeTrackingOrder.status.replace('_', ' ')}
              </span>
            </div>

            {/* Focused Delivery Map Component */}
            <div className="mb-4">
              <FocusedDeliveryMap
                order={activeTrackingOrder}
                customerName={activeTrackingOrder.buyerName}
                customerAddress={activeTrackingOrder.buyerAddress}
              />
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const label = getShippingLabelData(activeTrackingOrder.id);
                    setActiveShippingLabel(label);
                  }}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-neutral-300"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Inspect Cold-Chain Tag</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReportTargetOrderId(activeTrackingOrder.id);
                    setIsReportModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-rose-200"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Order Issue</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveTrackingOrderId(null)}
                className="px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-semibold"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Customer Issue Reporting Modal */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        initialOrderId={reportTargetOrderId}
      />

      {/* Cold-Chain Shipping Label Modal */}
      <ShippingLabelModal
        labelData={activeShippingLabel}
        onClose={() => setActiveShippingLabel(null)}
      />
    </div>
  );
};
