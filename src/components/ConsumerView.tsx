import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product, ShippingLabelData } from '../types';
import { PricingBreakdown } from './PricingBreakdown';
import { ShippingLabelModal } from './ShippingLabelModal';

export const ConsumerView: React.FC = () => {
  const {
    products,
    farms,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
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

  // Checkout form fields (synced with logged-in user profile)
  const [buyerName, setBuyerName] = useState(currentUser?.name || 'Elena Rostova');
  const [buyerAddress, setBuyerAddress] = useState(
    currentUser?.address
      ? `${currentUser.address}${currentUser.city ? `, ${currentUser.city}` : ''}${
          currentUser.zipCode ? ` ${currentUser.zipCode}` : ''
        }`
      : '742 Valencia St, Mission District, San Francisco'
  );
  const [buyerCoords, setBuyerCoords] = useState<[number, number]>([37.7599, -122.4148]);
  const [paymentGateway, setPaymentGateway] = useState<'Stripe Escrow' | 'ACH Direct Transfer' | 'Apple Pay Escrow'>('Stripe Escrow');
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
    const newOrder = checkoutCart(buyerName, buyerAddress, buyerCoords, paymentGateway);
    setCheckoutSuccessOrder(newOrder);
    setIsCheckoutModalOpen(false);
    setIsCartOpen(false);
  };

  const activeTrackingOrder = orders.find((o) => o.id === activeTrackingOrderId);

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
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> 88% Direct Grower Share
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Central Real-Time Inventory
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Batched Cold-Chain Delivery
            </span>
          </div>
        </div>

        {/* Decorative background accent */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none flex items-center justify-center">
          <span className="text-[140px]">🧺</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search apples, pasture eggs, greens..."
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
            <option value="all">All Regional Farms</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.locationName.split(',')[0]})
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
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                Purchase Confirmed · Order #{checkoutSuccessOrder.id}
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Central database updated! Stock decremented across {checkoutSuccessOrder.items.length} farm items, and{' '}
                <strong>${checkoutSuccessOrder.totalFarmerPayout.toFixed(2)} (88%)</strong> was credited to registered
                farmer balances.
              </p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTrackingOrderId(checkoutSuccessOrder.id);
                    setCheckoutSuccessOrder(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
                >
                  <Truck className="w-3.5 h-3.5" /> Track Live Delivery &amp; Batch
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutSuccessOrder(null)}
                  className="text-xs text-emerald-600 hover:text-emerald-800"
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
              <div className="relative h-48 w-full bg-neutral-100 overflow-hidden cursor-pointer" onClick={() => setInspectingProduct(product)}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                  {product.organic && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-800/90 backdrop-blur-xs text-white uppercase tracking-wider">
                      Certified Organic
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-900/80 backdrop-blur-xs text-white">
                    {product.category}
                  </span>
                </div>

                {/* Stock Status Pill */}
                <div className="absolute top-2.5 right-2.5">
                  {isOutOfStock ? (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-600 text-white">
                      Sold Out
                    </span>
                  ) : isLowStock ? (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500 text-white animate-pulse">
                      Only {product.stockQuantity} left
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-600/90 text-white">
                      {product.stockQuantity} in stock
                    </span>
                  )}
                </div>

                {/* Harvest timestamp badge */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-neutral-950/70 backdrop-blur-xs text-neutral-200 px-2.5 py-1 rounded-lg text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1 truncate">
                    <Calendar className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    {product.harvestDate}
                  </span>
                  <span className="text-emerald-400 font-semibold">{farm?.rating || 4.9} ★</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Farm Link & Crop Location */}
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                    <span className="font-semibold text-emerald-700 truncate">{product.farmName}</span>
                    <span className="text-[11px] text-neutral-400 truncate">📍 {product.location || farm?.locationName.split(',')[0]}</span>
                  </div>

                  {/* Title & Description */}
                  <h3
                    className="font-bold text-neutral-900 text-base line-clamp-1 cursor-pointer hover:text-emerald-700 transition-colors"
                    onClick={() => setInspectingProduct(product)}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-500">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                      🌱 {product.harvestDate}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Pricing & Automated Breakdown */}
                <div className="mt-4 pt-3 border-t border-neutral-150 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-neutral-900">
                        ${product.pricePerUnit.toFixed(2)}
                      </span>
                      <span className="text-xs text-neutral-500 ml-1">/ {product.unit}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInspectingProduct(product)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                    >
                      Audit Breakdown →
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
                    <span className="text-neutral-500">Central Inventory:</span>
                    <span className="font-semibold text-emerald-700">{inspectingProduct.stockQuantity} units available</span>
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
                      ${inspectingProduct.pricePerUnit.toFixed(2)}
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

      {/* Cart Drawer */}
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
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-neutral-400 text-center">
                  <ShoppingBag className="w-12 h-12 stroke-1 mb-2 text-neutral-300" />
                  <p className="text-sm font-medium text-neutral-600">Your direct cart is empty</p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                    Explore fresh harvest items from Sonoma, Napa, and Point Reyes producers.
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
                        ${(product.pricePerUnit * quantity).toFixed(2)}
                        <span className="text-[10px] font-normal text-neutral-500 ml-1">
                          (${product.pricePerUnit.toFixed(2)} / {product.unit})
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

      {/* Checkout Modal (Simulating instant verified order distribution) */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
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
                  Instant escrow disbursement to registered farmer accounts
                </p>
              </div>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Recipient Name
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
                  Delivery Destination (Urban Dropoff Hub / Residence)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  {/* Quick destination presets in the Bay Area delivery radius */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="text-neutral-400 py-0.5">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setBuyerAddress('742 Valencia St, Mission District, San Francisco');
                        setBuyerCoords([37.7599, -122.4148]);
                      }}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700"
                    >
                      SF Mission
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBuyerAddress('1540 Telegraph Ave, Uptown Oakland');
                        setBuyerCoords([37.8080, -122.2680]);
                      }}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700"
                    >
                      Oakland Uptown
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBuyerAddress('2128 Oxford St, Downtown Berkeley');
                        setBuyerCoords([37.8800, -122.2688]);
                      }}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700"
                    >
                      Berkeley
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Gateway Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Payment Processing Gateway
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Stripe Escrow', label: 'Stripe Connect', desc: 'Auto escrow & splits' },
                    { id: 'ACH Direct Transfer', label: 'Direct ACH', desc: 'Direct bank debit' },
                    { id: 'Apple Pay Escrow', label: 'Apple Pay', desc: 'Biometric 1-click' },
                  ].map((gateway) => (
                    <button
                      key={gateway.id}
                      type="button"
                      onClick={() => setPaymentGateway(gateway.id as any)}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        paymentGateway === gateway.id
                          ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
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
                  <span className="text-neutral-600">Total Purchase:</span>
                  <span className="font-bold text-neutral-900">${cartBreakdown.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Farmer Escrow Take-Home (88%):</span>
                  <span>${cartBreakdown.farmerAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Refrigerated Route Fee (7%):</span>
                  <span>${cartBreakdown.logisticsAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Platform Operations (5%):</span>
                  <span>${cartBreakdown.platformAmount.toFixed(2)}</span>
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

      {/* Order Tracking Modal if requested */}
      {activeTrackingOrder && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setActiveTrackingOrderId(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between mb-3 pr-6">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-700" />
                <h3 className="font-bold text-neutral-900 text-base">
                  Delivery Tracker · {activeTrackingOrder.id}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 uppercase">
                {activeTrackingOrder.status.replace('_', ' ')}
              </span>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-900 mb-4 space-y-1">
              <div className="font-semibold">Estimated Arrival: {activeTrackingOrder.deliveryEta}</div>
              <div className="text-purple-700 text-[11px]">
                Destination: {activeTrackingOrder.buyerAddress}
              </div>
              <div className="text-purple-600 text-[10px] font-mono flex items-center justify-between pt-1 border-t border-purple-200">
                <span>Batch: {activeTrackingOrder.assignedBatchId}</span>
                <span className="font-semibold">Paid via {activeTrackingOrder.paymentGateway || 'Stripe Escrow'}</span>
              </div>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-3 pl-2 border-l-2 border-emerald-500 text-xs">
              <div className="relative pl-4">
                <span className="absolute -left-[13px] top-0.5 w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-neutral-900">Order Placed &amp; Funds Escrowed</span>
                <p className="text-neutral-500 text-[11px]">88% allocated to registered farmers immediately</p>
              </div>
              <div className="relative pl-4">
                <span className={`absolute -left-[13px] top-0.5 w-3 h-3 rounded-full ${
                  activeTrackingOrder.status !== 'Pending' && activeTrackingOrder.status !== 'order_placed'
                    ? 'bg-emerald-500'
                    : 'bg-neutral-300'
                }`}></span>
                <span className="font-bold text-neutral-900">Consolidated into Farm Pickup Batch</span>
                <p className="text-neutral-500 text-[11px]">Route optimizer grouped pickups with nearby orchards</p>
              </div>
              <div className="relative pl-4">
                <span className={`absolute -left-[13px] top-0.5 w-3 h-3 rounded-full ${
                  activeTrackingOrder.status === 'Dispatched' || activeTrackingOrder.status === 'Delivered' || activeTrackingOrder.status === 'delivered'
                    ? 'bg-sky-500'
                    : 'bg-neutral-300'
                }`}></span>
                <span className="font-bold text-sky-900">Cold-Chain Sorting &amp; Packing</span>
                <p className="text-neutral-500 text-[11px]">Emeryville Hub temperature inspection passed</p>
              </div>
              <div className="relative pl-4">
                <span className={`absolute -left-[13px] top-0.5 w-3 h-3 rounded-full ${
                  activeTrackingOrder.status === 'Delivered' || activeTrackingOrder.status === 'delivered'
                    ? 'bg-emerald-500'
                    : 'bg-neutral-300'
                }`}></span>
                <span className="font-bold text-purple-900">Out for Last-Mile Delivery</span>
                <p className="text-neutral-500 text-[11px]">Electric cold-van on optimized dropoff sequence</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const label = getShippingLabelData(activeTrackingOrder.id);
                  setActiveShippingLabel(label);
                }}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-neutral-300"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Inspect Shipping Label</span>
              </button>

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

      {/* Cold-Chain Shipping Label Modal */}
      <ShippingLabelModal
        labelData={activeShippingLabel}
        onClose={() => setActiveShippingLabel(null)}
      />
    </div>
  );
};
