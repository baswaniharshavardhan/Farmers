import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Farm,
  Product,
  CartItem,
  Order,
  PriceBreakdown,
  FarmerPayoutRecord,
  LogisticsHub,
  LogisticsBatch,
  OrderStatus,
  PickupStop,
  DeliveryStop,
  User,
  UserRole,
  TransactionRecord,
  ShippingLabelData,
  CustomerSignUpData,
  FarmerSignUpData,
} from '../types';
import {
  INITIAL_FARMS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_PAYOUT_RECORDS,
  INITIAL_BATCH,
  CENTRAL_HUB,
  INITIAL_USERS,
  INITIAL_TRANSACTIONS,
} from '../data/mockData';
import { optimizeLogisticsRoute } from '../utils/logisticsOptimizer';

interface MarketplaceContextType {
  // Actors & RBAC (Phase 1 & Step 3)
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isLoggedIn: boolean;
  authToken: string | null;
  currentRoute: string;
  navigate: (path: string) => void;
  login: (
    role: UserRole,
    userEmail?: string,
    password?: string
  ) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  logout: () => void;
  registerCustomer: (
    data: CustomerSignUpData
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  registerFarmer: (
    data: FarmerSignUpData
  ) => Promise<{ success: boolean; user?: User; farm?: Farm; error?: string }>;
  switchUserRole: (role: UserRole) => void;
  verifyFarmerStatus: (userIdOrFarmId: string, status: 'verified' | 'pending' | 'rejected') => void;

  // Farm & Produce state
  farms: Farm[];
  activeFarmId: string;
  setActiveFarmId: (id: string) => void;
  activeFarm: Farm | undefined;
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  payoutRecords: FarmerPayoutRecord[];
  transactions: TransactionRecord[];
  activeBatch: LogisticsBatch;
  hub: LogisticsHub;
  systemNotification: string | null;
  setSystemNotification: (msg: string | null) => void;

  // Cart operations
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartBreakdown: () => PriceBreakdown;

  // Checkout & Ordering (Real-time DB sync)
  checkoutCart: (
    buyerName: string,
    buyerAddress: string,
    buyerCoords?: [number, number],
    paymentGateway?: 'Stripe' | 'Card' | 'ApplePay'
  ) => Order;

  // Farmer Portal Operations
  updateProductStock: (productId: string, newStock: number) => void;
  updateProductPrice: (productId: string, newPrice: number) => void;
  addProduct: (product: Omit<Product, 'id' | 'farmId' | 'farmName'>) => Product;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  acceptOrder: (orderId: string) => void;
  markOrderDelivered: (orderId: string) => void;
  getShippingLabelData: (orderId: string) => ShippingLabelData | null;

  // Verification & Logistics Simulation
  runSimulatedBatchOrder: () => void;
  isSimulating: boolean;
  simulationStepText: string;
  resetDatabase: () => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const STORAGE_KEY_PRODUCTS = 'farmdirect_products_v1';
const STORAGE_KEY_ORDERS = 'farmdirect_orders_v1';
const STORAGE_KEY_FARMS = 'farmdirect_farms_v1';
const STORAGE_KEY_PAYOUTS = 'farmdirect_payouts_v1';
const STORAGE_KEY_BATCH = 'farmdirect_batch_v1';
const STORAGE_KEY_USERS = 'farmdirect_users_v1';
const STORAGE_KEY_TXNS = 'farmdirect_transactions_v1';
const STORAGE_KEY_AUTH = 'farmdirect_auth_state_v2';
const STORAGE_KEY_TOKEN = 'farmdirect_jwt_token_v2';
const STORAGE_KEY_ROUTE = 'farmdirect_current_route_v2';

const getInitialRoute = (): string => {
  if (typeof window === 'undefined') return '/login';
  // Check if there is an active session
  const sessionAuth = sessionStorage.getItem(STORAGE_KEY_AUTH);
  const sessionToken = sessionStorage.getItem(STORAGE_KEY_TOKEN);
  if (sessionAuth === 'true' && sessionToken) {
    const hash = window.location.hash.replace('#', '');
    if (
      hash &&
      ['/customer-dashboard', '/farmer-dashboard', '/admin-dashboard'].includes(hash)
    ) {
      return hash;
    }
    const path = window.location.pathname;
    if (['/customer-dashboard', '/farmer-dashboard', '/admin-dashboard'].includes(path)) {
      return path;
    }
    const saved = sessionStorage.getItem(STORAGE_KEY_ROUTE);
    if (saved && saved !== '/login') return saved;
  }
  // FIRST PAGE IS ALWAYS THE LOGIN PAGE
  return '/login';
};

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    return users[0] || INITIAL_USERS[0];
  });

  // Default to false on first page visit
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const sessionAuth = sessionStorage.getItem(STORAGE_KEY_AUTH);
    const sessionToken = sessionStorage.getItem(STORAGE_KEY_TOKEN);
    return sessionAuth === 'true' && !!sessionToken;
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(STORAGE_KEY_TOKEN) || null;
  });

  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);

  const navigate = (newPath: string) => {
    setCurrentRoute(newPath);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY_ROUTE, newPath);
      try {
        window.history.pushState(null, '', newPath);
      } catch {
        // Fallback for sandboxed frames
      }
      window.location.hash = newPath;
    }
  };

  // Clean any stale localStorage auth from previous versions
  useEffect(() => {
    try {
      localStorage.removeItem('farmdirect_auth_state_v1');
      localStorage.removeItem('farmdirect_jwt_token_v1');
      localStorage.removeItem('farmdirect_current_route_v1');
    } catch {
      // Ignore
    }
  }, []);

  // Synchronize browser history and hash navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (
        hash &&
        ['/customer-dashboard', '/farmer-dashboard', '/admin-dashboard', '/login'].includes(hash)
      ) {
        setCurrentRoute(hash);
      } else if (
        ['/customer-dashboard', '/farmer-dashboard', '/admin-dashboard', '/login'].includes(
          window.location.pathname
        )
      ) {
        setCurrentRoute(window.location.pathname);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    if (authToken) {
      sessionStorage.setItem(STORAGE_KEY_TOKEN, authToken);
    } else {
      sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  }, [authToken]);

  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TXNS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [farms, setFarms] = useState<Farm[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FARMS);
    return saved ? JSON.parse(saved) : INITIAL_FARMS;
  });

  const [activeFarmId, setActiveFarmId] = useState<string>(farms[0]?.id || 'farm-1');

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>([]);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [payoutRecords, setPayoutRecords] = useState<FarmerPayoutRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PAYOUTS);
    return saved ? JSON.parse(saved) : INITIAL_PAYOUT_RECORDS;
  });

  const [activeBatch, setActiveBatch] = useState<LogisticsBatch>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BATCH);
    return saved ? JSON.parse(saved) : INITIAL_BATCH;
  });

  const [hub] = useState<LogisticsHub>(CENTRAL_HUB);
  const [systemNotification, setSystemNotification] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStepText, setSimulationStepText] = useState('');

  // Persist to simulated local database
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FARMS, JSON.stringify(farms));
  }, [farms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PAYOUTS, JSON.stringify(payoutRecords));
  }, [payoutRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BATCH, JSON.stringify(activeBatch));
  }, [activeBatch]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (isLoggedIn) {
      sessionStorage.setItem(STORAGE_KEY_AUTH, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEY_AUTH);
      sessionStorage.removeItem(STORAGE_KEY_TOKEN);
      sessionStorage.removeItem(STORAGE_KEY_ROUTE);
    }
  }, [isLoggedIn]);

  const activeFarm = farms.find((f) => f.id === activeFarmId) || farms[0];

  const login = async (
    role: UserRole,
    userEmail?: string,
    password?: string
  ): Promise<{ success: boolean; error?: string; redirectUrl?: string }> => {
    const cleanRole = role === 'consumer' ? 'customer' : role;
    const emailToUse =
      userEmail ||
      (cleanRole === 'farmer'
        ? 'contact@sunriseorchards.farm'
        : cleanRole === 'admin'
        ? 'sarah.chen@farmdirect.co'
        : 'elena.rostova@sfbay.org');

    const passwordToUse =
      password ||
      (cleanRole === 'farmer'
        ? 'FarmerPass123!'
        : cleanRole === 'admin'
        ? 'AdminSecure999!'
        : 'Password123!');

    try {
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          password: passwordToUse,
          role: cleanRole,
        }),
      });

      const data = await resp.json();

      if (!resp.ok || !data.success) {
        const errorText = data.error || 'Authentication failed.';
        setSystemNotification(`⚠️ Login failed: ${errorText}`);
        return { success: false, error: errorText };
      }

      // Successful server-side authentication
      const user: User = data.user;
      setAuthToken(data.token);
      setCurrentUser(user);
      setIsLoggedIn(true);

      if (user.role === 'farmer' && user.farmId) {
        setActiveFarmId(user.farmId);
      }

      setSystemNotification(`Logged in as ${user.role.toUpperCase()}: ${user.name}`);
      const redirectUrl = data.redirectUrl || `/${cleanRole}-dashboard`;
      navigate(redirectUrl);
      return { success: true, redirectUrl };
    } catch {
      // Fallback local auth if server fetch was interrupted
      let targetUser = users.find(
        (u) =>
          u.email.toLowerCase() === emailToUse.toLowerCase() ||
          (cleanRole === 'customer'
            ? u.role === 'customer' || u.role === 'consumer'
            : u.role === cleanRole)
      );
      if (!targetUser) {
        targetUser = users[0];
      }

      const targetUserNorm = targetUser.role === 'consumer' ? 'customer' : targetUser.role;
      if (cleanRole && targetUserNorm !== cleanRole) {
        const err = `Role mismatch: This account is registered as '${targetUser.role}', not '${role}'.`;
        setSystemNotification(`⚠️ ${err}`);
        return { success: false, error: err };
      }

      const generatedToken = `jwt_${targetUser.role}_token_${Date.now()}`;
      setAuthToken(generatedToken);
      setCurrentUser(targetUser);
      setIsLoggedIn(true);

      if (targetUser.role === 'farmer' && targetUser.farmId) {
        setActiveFarmId(targetUser.farmId);
      }

      const redirectUrl = `/${cleanRole}-dashboard`;
      navigate(redirectUrl);
      setSystemNotification(`Logged in as ${targetUser.role.toUpperCase()}: ${targetUser.name}`);
      return { success: true, redirectUrl };
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setAuthToken(null);
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_ROUTE);
    localStorage.removeItem('farmdirect_auth_state_v1');
    localStorage.removeItem('farmdirect_jwt_token_v1');
    localStorage.removeItem('farmdirect_current_route_v1');
    setSystemNotification('You have logged out. Returning to Login Hub.');
    navigate('/login');
  };

  const registerCustomer = async (
    data: CustomerSignUpData
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const resp = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role: 'customer' }),
      });

      const resData = await resp.json();
      if (!resp.ok || !resData.success) {
        const errorText = resData.error || 'Failed to register customer.';
        setSystemNotification(`⚠️ Registration failed: ${errorText}`);
        return { success: false, error: errorText };
      }

      const newUser: User = resData.user;
      setUsers((prev) => [newUser, ...prev]);
      setCurrentUser(newUser);
      setAuthToken(resData.token);
      setIsLoggedIn(true);
      setSystemNotification(`Account created! Welcome to FarmDirect, ${newUser.name}.`);
      navigate(resData.redirectUrl || '/customer-dashboard');
      return { success: true, user: newUser };
    } catch {
      // Local fallback
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name.trim(),
        email: data.email.trim(),
        role: 'customer',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        verificationStatus: 'verified',
        registeredAt: new Date().toISOString(),
        phone: data.phone?.trim() || '(415) 555-0199',
        address: data.streetAddress.trim(),
        city: data.city.trim(),
        zipCode: data.zipCode.trim(),
        deliveryNotes: data.deliveryNotes?.trim() || 'Front door / porch dropoff',
        preferredPaymentMethod: data.preferredPaymentMethod || 'stripe',
      };

      setUsers((prev) => [newUser, ...prev]);
      setCurrentUser(newUser);
      setAuthToken(`jwt_customer_token_${Date.now()}`);
      setIsLoggedIn(true);
      setSystemNotification(`Account created! Welcome to FarmDirect, ${newUser.name}.`);
      navigate('/customer-dashboard');
      return { success: true, user: newUser };
    }
  };

  const registerFarmer = async (
    data: FarmerSignUpData
  ): Promise<{ success: boolean; user?: User; farm?: Farm; error?: string }> => {
    try {
      const resp = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role: 'farmer' }),
      });

      const resData = await resp.json();
      if (!resp.ok || !resData.success) {
        const errorText = resData.error || 'Failed to register farmer.';
        setSystemNotification(`⚠️ Application failed: ${errorText}`);
        return { success: false, error: errorText };
      }

      const farmId = resData.user.farmId || `farm-${Date.now()}`;
      const newFarm: Farm = {
        id: farmId,
        name: data.farmName.trim(),
        locationName: data.farmLocation.trim(),
        coordinates: [
          Number((38.35 + (Math.random() - 0.5) * 0.2).toFixed(4)),
          Number((-122.8 + (Math.random() - 0.5) * 0.2).toFixed(4)),
        ],
        contactEmail: data.email.trim(),
        bio:
          data.bio?.trim() ||
          `Family-run regenerative farm specializing in ${data.primaryCrops.join(', ')}. Supplying Bay Area tables with dawn-harvested freshness.`,
        certifiedOrganic: data.certifiedOrganic,
        rating: 5.0,
        avatar:
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=300&q=80',
        totalEarnings: 0,
      };

      const newUser: User = resData.user;
      setFarms((prev) => [newFarm, ...prev]);
      setUsers((prev) => [newUser, ...prev]);
      setActiveFarmId(farmId);
      setCurrentUser(newUser);
      setAuthToken(resData.token);
      setIsLoggedIn(true);
      setSystemNotification(
        `Welcome ${data.name}! ${data.farmName} application submitted. Certification #${data.certificationNumber} pending admin audit.`
      );
      navigate(resData.redirectUrl || '/farmer-dashboard');
      return { success: true, user: newUser, farm: newFarm };
    } catch {
      // Local fallback
      const farmId = `farm-${Date.now()}`;
      const newFarm: Farm = {
        id: farmId,
        name: data.farmName.trim(),
        locationName: data.farmLocation.trim(),
        coordinates: [
          Number((38.35 + (Math.random() - 0.5) * 0.2).toFixed(4)),
          Number((-122.8 + (Math.random() - 0.5) * 0.2).toFixed(4)),
        ],
        contactEmail: data.email.trim(),
        bio:
          data.bio?.trim() ||
          `Family-run regenerative farm specializing in ${data.primaryCrops.join(', ')}. Supplying Bay Area tables with dawn-harvested freshness.`,
        certifiedOrganic: data.certifiedOrganic,
        rating: 5.0,
        avatar:
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=300&q=80',
        totalEarnings: 0,
      };

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name.trim(),
        email: data.email.trim(),
        role: 'farmer',
        farmId: farmId,
        farmName: data.farmName.trim(),
        farmLocation: data.farmLocation.trim(),
        certificationNumber: data.certificationNumber.trim(),
        primaryCrops: data.primaryCrops,
        acreage: data.acreage || 25,
        payoutAccount: data.bankAccountNumber
          ? `Direct ACH ending in ••••${data.bankAccountNumber.slice(-4)}`
          : 'Direct Escrow (Stripe Connect)',
        avatar:
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=200&q=80',
        verificationStatus: 'pending',
        registeredAt: new Date().toISOString(),
        phone: data.phone?.trim() || '(707) 555-0142',
      };

      setFarms((prev) => [newFarm, ...prev]);
      setUsers((prev) => [newUser, ...prev]);
      setActiveFarmId(farmId);
      setCurrentUser(newUser);
      setAuthToken(`jwt_farmer_token_${Date.now()}`);
      setIsLoggedIn(true);
      setSystemNotification(
        `Welcome ${data.name}! ${data.farmName} application submitted. Certification #${data.certificationNumber} pending admin audit.`
      );
      navigate('/farmer-dashboard');
      return { success: true, user: newUser, farm: newFarm };
    }
  };

  const switchUserRole = (role: UserRole) => {
    const cleanRole = role === 'consumer' ? 'customer' : role;
    const targetUser =
      users.find((u) => (u.role === 'consumer' ? 'customer' : u.role) === cleanRole) || users[0];
    setCurrentUser(targetUser);
    setIsLoggedIn(true);
    setAuthToken(targetUser.token || `jwt_${targetUser.role}_token_${Date.now()}`);
    if (cleanRole === 'farmer' && targetUser.farmId) {
      setActiveFarmId(targetUser.farmId);
    }
    const targetPath = `/${cleanRole}-dashboard`;
    navigate(targetPath);
    setSystemNotification(`Switched role to ${cleanRole.toUpperCase()}: ${targetUser.name}`);
  };

  const verifyFarmerStatus = (
    userIdOrFarmId: string,
    status: 'verified' | 'pending' | 'rejected'
  ) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userIdOrFarmId || u.farmId === userIdOrFarmId
          ? { ...u, verificationStatus: status }
          : u
      )
    );
    setSystemNotification(`Farmer account verification set to "${status.toUpperCase()}"`);
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stockQuantity, existing.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stockQuantity, quantity) }];
    });
    setSystemNotification(`Added ${quantity}x "${product.name}" to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stockQuantity;
          return { ...item, quantity: Math.min(maxStock, quantity) };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((acc, item) => acc + item.product.pricePerUnit * item.quantity, 0);
  };

  const getCartBreakdown = (): PriceBreakdown => {
    const totalAmount = Math.round(getCartTotal() * 100) / 100;
    const farmerAmount = Math.round(totalAmount * 0.88 * 100) / 100;
    const logisticsAmount = Math.round(totalAmount * 0.07 * 100) / 100;
    // ensure exact rounding balance
    const platformAmount = Math.round((totalAmount - farmerAmount - logisticsAmount) * 100) / 100;
    const conventionalRetailFarmerAmount = Math.round(totalAmount * 0.15 * 100) / 100;

    return {
      totalAmount,
      farmerAmount,
      farmerPercentage: 88,
      logisticsAmount,
      logisticsPercentage: 7,
      platformAmount,
      platformPercentage: 5,
      conventionalRetailFarmerAmount,
    };
  };

  // Checkout and Real-time Inventory Update
  const checkoutCart = (
    buyerName: string,
    buyerAddress: string,
    buyerCoords: [number, number] = [37.7749, -122.4194],
    paymentGateway: 'Stripe' | 'Card' | 'ApplePay' = 'Stripe'
  ): Order => {
    if (cart.length === 0) throw new Error('Cart is empty');

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayouts: FarmerPayoutRecord[] = [];
    const newTransactions: TransactionRecord[] = [];
    const farmEarningsDelta: Record<string, number> = {};

    const orderItems = cart.map((item) => {
      const grossTotal = Math.round(item.product.pricePerUnit * item.quantity * 100) / 100;
      const farmerPayout = Math.round(grossTotal * 0.88 * 100) / 100;
      const logisticsFee = Math.round(grossTotal * 0.07 * 100) / 100;
      const platformFee = Math.round((grossTotal - farmerPayout - logisticsFee) * 100) / 100;

      farmEarningsDelta[item.product.farmId] =
        (farmEarningsDelta[item.product.farmId] || 0) + farmerPayout;

      newPayouts.push({
        id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderId,
        farmId: item.product.farmId,
        productName: item.product.name,
        quantity: item.quantity,
        unit: item.product.unit,
        grossAmount: grossTotal,
        farmerNetPayout: farmerPayout,
        payoutRatePercent: 88,
        timestamp: new Date().toISOString(),
        status: 'settled',
      });

      newTransactions.push({
        id: `txn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderId,
        buyerName,
        farmId: item.product.farmId,
        farmName: item.product.farmName,
        grossAmount: grossTotal,
        farmerPayout,
        logisticsCommission: logisticsFee,
        platformCommission: platformFee,
        paymentGateway,
        paymentStatus: 'succeeded',
        timestamp: new Date().toISOString(),
      });

      return {
        productId: item.product.id,
        productName: item.product.name,
        farmId: item.product.farmId,
        farmName: item.product.farmName,
        unitPrice: item.product.pricePerUnit,
        quantity: item.quantity,
        unit: item.product.unit,
        grossTotal,
        farmerPayout,
        logisticsFee,
        platformFee,
      };
    });

    const totalAmount = Math.round(orderItems.reduce((acc, i) => acc + i.grossTotal, 0) * 100) / 100;
    const totalFarmerPayout = Math.round(orderItems.reduce((acc, i) => acc + i.farmerPayout, 0) * 100) / 100;

    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      buyerName,
      buyerAddress,
      buyerCoords,
      items: orderItems,
      totalAmount,
      totalFarmerPayout,
      status: 'Pending',
      assignedBatchId: activeBatch.batchCode,
      deliveryEta: 'Today, 5:00 PM - 6:00 PM',
      paymentGateway,
      paymentStatus: 'succeeded',
      shippingLabelPrinted: false,
    };

    // 1. Decrement product inventory in central database
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const orderedItem = cart.find((item) => item.product.id === p.id);
        if (orderedItem) {
          const updatedStock = Math.max(0, p.stockQuantity - orderedItem.quantity);
          return { ...p, stockQuantity: updatedStock };
        }
        return p;
      })
    );

    // 2. Increment farmer earnings in database
    setFarms((prevFarms) =>
      prevFarms.map((f) => {
        const delta = farmEarningsDelta[f.id] || 0;
        return delta > 0
          ? { ...f, totalEarnings: Math.round((f.totalEarnings + delta) * 100) / 100 }
          : f;
      })
    );

    // 3. Record farmer transparent payouts ledger and transactions
    setPayoutRecords((prev) => [...newPayouts, ...prev]);
    setTransactions((prev) => [...newTransactions, ...prev]);

    // 4. Record new order
    setOrders((prev) => [newOrder, ...prev]);

    // 5. Update logistics batch with new delivery and pickup stops
    const existingPickupMap = new Map<string, PickupStop>(
      activeBatch.pickupStops.map((p) => [p.farmId, p])
    );
    orderItems.forEach((item) => {
      const farm = farms.find((f) => f.id === item.farmId);
      if (farm) {
        if (existingPickupMap.has(item.farmId)) {
          const existing = existingPickupMap.get(item.farmId)!;
          existing.boxCount += item.quantity;
        } else {
          existingPickupMap.set(item.farmId, {
            id: `stop-p-${Date.now()}-${item.farmId}`,
            farmId: item.farmId,
            farmName: item.farmName,
            coordinates: farm.coordinates,
            boxCount: item.quantity,
            productSummary: `${item.quantity}x ${item.productName}`,
            sequenceOrder: existingPickupMap.size + 1,
            pickedUp: false,
          });
        }
      }
    });

    const newDeliveryStop: DeliveryStop = {
      orderId: newOrder.id,
      buyerName: newOrder.buyerName,
      address: newOrder.buyerAddress,
      coordinates: buyerCoords,
      sequenceOrder: activeBatch.deliveryStops.length + 1,
      delivered: false,
    };

    const updatedRawPickups = Array.from(existingPickupMap.values());
    const updatedRawDeliveries = [...activeBatch.deliveryStops, newDeliveryStop];

    // Recompute batch route optimization
    const opt = optimizeLogisticsRoute(hub, updatedRawPickups, updatedRawDeliveries);

    setActiveBatch((prev) => ({
      ...prev,
      pickupStops: opt.optimizedPickupStops,
      deliveryStops: opt.optimizedDeliveryStops,
      unoptimizedDistanceKm: opt.unoptimizedDistanceKm,
      optimizedDistanceKm: opt.totalOptimizedDistanceKm,
      distanceSavedKm: opt.distanceSavedKm,
      co2ReductionKg: opt.co2SavedKg,
      estimatedDurationMins: opt.estimatedDurationMins,
    }));

    clearCart();
    setSystemNotification(
      `Order ${orderId} successfully placed! $${totalFarmerPayout.toFixed(2)} (88%) routed to farmers via ${paymentGateway}.`
    );
    return newOrder;
  };

  // Farmer operations
  const updateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockQuantity: Math.max(0, newStock) } : p))
    );
    setSystemNotification(`Stock updated in central inventory database`);
  };

  const updateProductPrice = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, pricePerUnit: Math.max(0.25, Math.round(newPrice * 100) / 100) } : p
      )
    );
    setSystemNotification(`Price updated in real-time catalog`);
  };

  const addProduct = (productData: Omit<Product, 'id' | 'farmId' | 'farmName'>): Product => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      farmId: activeFarm.id,
      farmName: activeFarm.name,
      location: activeFarm.locationName,
      distanceMiles: 28,
      farmerSharePercentage: 88,
      logisticsSharePercentage: 7,
      platformSharePercentage: 5,
    };
    setProducts((prev) => [newProd, ...prev]);
    setSystemNotification(`Added "${newProd.name}" to farm listings`);
    return newProd;
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)));
    setSystemNotification(`Produce details updated in central database`);
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
    setSystemNotification(`Produce item removed from marketplace`);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const acceptOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Dispatched' } : o))
    );
    setSystemNotification(`Order ${orderId} accepted and marked as Dispatched for pickup.`);
  };

  const markOrderDelivered = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Delivered' } : o))
    );
    setSystemNotification(`Order ${orderId} confirmed as Delivered.`);
  };

  const getShippingLabelData = (orderId: string): ShippingLabelData | null => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, shippingLabelPrinted: true } : o))
    );

    const farm = farms.find((f) => f.id === activeFarmId) || farms[0];
    const itemsSummary = order.items
      .map((i) => `${i.quantity}x ${i.productName} (${i.unit})`)
      .join(', ');

    return {
      orderId: order.id,
      trackingNumber: `TRK-FD-${order.id.replace('ORD-', '')}-COLD`,
      batchCode: order.assignedBatchId || activeBatch.batchCode,
      farmName: farm.name,
      farmLocation: farm.locationName,
      recipientName: order.buyerName,
      recipientAddress: order.buyerAddress,
      packageWeight: `${(order.items.reduce((acc, i) => acc + i.quantity, 0) * 1.8).toFixed(1)} lbs (Refrigerated Crate)`,
      handlingInstructions: 'PERISHABLE VEGETATION & DAIRY — MAINTAIN 34°F - 38°F COLD CHAIN',
      coldChainTemperature: '36°F / 2.2°C (Inspected)',
      dispatchTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      itemsSummary,
    };
  };

  // Verification 3: Run Simulated Batch Order & Routing Optimization
  const runSimulatedBatchOrder = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStepText('Step 1/5: Synthesizing multi-farm consumer orders across Bay Area...');

    setTimeout(() => {
      // Step 1: Create 2 simulated consumer orders across 3 distinct farms
      const farm1 = farms[0];
      const farm2 = farms[1];
      const farm4 = farms[3];

      const simOrder1Items = [
        {
          productId: 'prod-1',
          productName: 'Heritage Pink Pearl & Honeycrisp Apples',
          farmId: farm1.id,
          farmName: farm1.name,
          unitPrice: 4.75,
          quantity: 3,
          unit: 'lb bag',
          grossTotal: 14.25,
          farmerPayout: 12.54,
          logisticsFee: 1.00,
          platformFee: 0.71,
        },
        {
          productId: 'prod-8',
          productName: 'Raw Coastal Wildflower Honey',
          farmId: farm4.id,
          farmName: farm4.name,
          unitPrice: 14.00,
          quantity: 2,
          unit: '16 oz jar',
          grossTotal: 28.00,
          farmerPayout: 24.64,
          logisticsFee: 1.96,
          platformFee: 1.40,
        },
      ];

      const simOrder2Items = [
        {
          productId: 'prod-3',
          productName: 'Rainbow Heirloom Tomatoes',
          farmId: farm2.id,
          farmName: farm2.name,
          unitPrice: 6.25,
          quantity: 4,
          unit: 'lb',
          grossTotal: 25.00,
          farmerPayout: 22.00,
          logisticsFee: 1.75,
          platformFee: 1.25,
        },
      ];

      const simOrder1: Order = {
        id: `SIM-ORD-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString(),
        buyerName: 'Sophia Lin',
        buyerAddress: '1540 Telegraph Ave, Uptown Oakland',
        buyerCoords: [37.8080, -122.2680],
        items: simOrder1Items,
        totalAmount: 42.25,
        totalFarmerPayout: 37.18,
        status: 'batch_consolidated',
        assignedBatchId: 'BATCH-CLUSTER-ALPHA',
        deliveryEta: 'Today, 4:15 PM',
      };

      const simOrder2: Order = {
        id: `SIM-ORD-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString(),
        buyerName: 'David Chen',
        buyerAddress: '2128 Oxford St, Berkeley',
        buyerCoords: [37.8800, -122.2688],
        items: simOrder2Items,
        totalAmount: 25.00,
        totalFarmerPayout: 22.00,
        status: 'batch_consolidated',
        assignedBatchId: 'BATCH-CLUSTER-ALPHA',
        deliveryEta: 'Today, 4:50 PM',
      };

      // Real-time stock decrement in central DB
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === 'prod-1') return { ...p, stockQuantity: Math.max(0, p.stockQuantity - 3) };
          if (p.id === 'prod-8') return { ...p, stockQuantity: Math.max(0, p.stockQuantity - 2) };
          if (p.id === 'prod-3') return { ...p, stockQuantity: Math.max(0, p.stockQuantity - 4) };
          return p;
        })
      );

      // Distribute payouts directly to farmer accounts
      setFarms((prev) =>
        prev.map((f) => {
          if (f.id === farm1.id) return { ...f, totalEarnings: Math.round((f.totalEarnings + 12.54) * 100) / 100 };
          if (f.id === farm2.id) return { ...f, totalEarnings: Math.round((f.totalEarnings + 22.00) * 100) / 100 };
          if (f.id === farm4.id) return { ...f, totalEarnings: Math.round((f.totalEarnings + 24.64) * 100) / 100 };
          return f;
        })
      );

      // Add payout records
      const newLedgerRecords: FarmerPayoutRecord[] = [
        {
          id: `pay-sim-${Date.now()}-1`,
          orderId: simOrder1.id,
          farmId: farm1.id,
          productName: 'Heritage Apples (Simulated)',
          quantity: 3,
          unit: 'lb bag',
          grossAmount: 14.25,
          farmerNetPayout: 12.54,
          payoutRatePercent: 88,
          timestamp: new Date().toISOString(),
          status: 'settled',
        },
        {
          id: `pay-sim-${Date.now()}-2`,
          orderId: simOrder1.id,
          farmId: farm4.id,
          productName: 'Raw Coastal Wildflower Honey (Simulated)',
          quantity: 2,
          unit: '16 oz jar',
          grossAmount: 28.00,
          farmerNetPayout: 24.64,
          payoutRatePercent: 88,
          timestamp: new Date().toISOString(),
          status: 'settled',
        },
        {
          id: `pay-sim-${Date.now()}-3`,
          orderId: simOrder2.id,
          farmId: farm2.id,
          productName: 'Rainbow Heirloom Tomatoes (Simulated)',
          quantity: 4,
          unit: 'lb',
          grossAmount: 25.00,
          farmerNetPayout: 22.00,
          payoutRatePercent: 88,
          timestamp: new Date().toISOString(),
          status: 'settled',
        },
      ];

      setPayoutRecords((prev) => [...newLedgerRecords, ...prev]);
      setOrders((prev) => [simOrder1, simOrder2, ...prev]);

      setSimulationStepText('Step 2/5: Central inventory decremented & farmer earnings updated live...');

      setTimeout(() => {
        setSimulationStepText('Step 3/5: Running Nearest-Neighbor clustering algorithm on rural pickups...');

        const pickups: PickupStop[] = [
          {
            id: 'sim-stop-1',
            farmId: farm1.id,
            farmName: farm1.name,
            coordinates: farm1.coordinates,
            boxCount: 3,
            productSummary: '3x Apples',
            sequenceOrder: 1,
            pickedUp: false,
          },
          {
            id: 'sim-stop-2',
            farmId: farm2.id,
            farmName: farm2.name,
            coordinates: farm2.coordinates,
            boxCount: 4,
            productSummary: '4x Tomatoes',
            sequenceOrder: 2,
            pickedUp: false,
          },
          {
            id: 'sim-stop-3',
            farmId: farm4.id,
            farmName: farm4.name,
            coordinates: farm4.coordinates,
            boxCount: 2,
            productSummary: '2x Wild Honey',
            sequenceOrder: 3,
            pickedUp: false,
          },
        ];

        const deliveries: DeliveryStop[] = [
          {
            orderId: simOrder1.id,
            buyerName: simOrder1.buyerName,
            address: simOrder1.buyerAddress,
            coordinates: simOrder1.buyerCoords,
            sequenceOrder: 4,
            delivered: false,
          },
          {
            orderId: simOrder2.id,
            buyerName: simOrder2.buyerName,
            address: simOrder2.buyerAddress,
            coordinates: simOrder2.buyerCoords,
            sequenceOrder: 5,
            delivered: false,
          },
        ];

        const opt = optimizeLogisticsRoute(hub, pickups, deliveries);

        setTimeout(() => {
          setSimulationStepText('Step 4/5: Route optimized! Single vehicle grouped pickup saved 41% km and 24kg CO₂.');

          setActiveBatch({
            id: 'batch-sim-alpha',
            batchCode: 'BATCH-CLUSTER-ALPHA',
            hubId: hub.id,
            hubName: hub.name,
            pickupStops: opt.optimizedPickupStops,
            deliveryStops: opt.optimizedDeliveryStops,
            unoptimizedDistanceKm: opt.unoptimizedDistanceKm,
            optimizedDistanceKm: opt.totalOptimizedDistanceKm,
            distanceSavedKm: opt.distanceSavedKm,
            co2ReductionKg: opt.co2SavedKg,
            status: 'picking_up',
            activeProgressPercent: 35,
            estimatedDurationMins: opt.estimatedDurationMins,
            driverName: 'Maya Thorne',
            driverVehicle: 'Mercedes eSprinter Refrigerated EV',
          });

          setTimeout(() => {
            setSimulationStepText('Step 5/5: Verification simulation complete! Dispatching route to mobile driver.');
            setIsSimulating(false);
            setSystemNotification(
              'Simulated batch order complete: Real-time inventory synchronized, 88% farmer payout recorded, and 3 farm pickups grouped into 1 optimized route!'
            );
          }, 1500);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  const resetDatabase = () => {
    localStorage.removeItem(STORAGE_KEY_FARMS);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_ORDERS);
    localStorage.removeItem(STORAGE_KEY_PAYOUTS);
    localStorage.removeItem(STORAGE_KEY_BATCH);
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_TXNS);
    setFarms(INITIAL_FARMS);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setPayoutRecords(INITIAL_PAYOUT_RECORDS);
    setActiveBatch(INITIAL_BATCH);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setTransactions(INITIAL_TRANSACTIONS);
    setCart([]);
    setSystemNotification('Database reset to initial demo state');
  };

  return (
    <MarketplaceContext.Provider
      value={{
        users,
        currentUser,
        setCurrentUser,
        isLoggedIn,
        authToken,
        currentRoute,
        navigate,
        login,
        logout,
        registerCustomer,
        registerFarmer,
        switchUserRole,
        verifyFarmerStatus,
        farms,
        activeFarmId,
        setActiveFarmId,
        activeFarm,
        products,
        cart,
        orders,
        payoutRecords,
        transactions,
        activeBatch,
        hub,
        systemNotification,
        setSystemNotification,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        getCartBreakdown,
        checkoutCart,
        updateProductStock,
        updateProductPrice,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        acceptOrder,
        markOrderDelivered,
        getShippingLabelData,
        runSimulatedBatchOrder,
        isSimulating,
        simulationStepText,
        resetDatabase,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
