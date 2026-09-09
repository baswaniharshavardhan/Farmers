export type UserRole = 'farmer' | 'customer' | 'admin' | 'consumer';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  role: UserRole;
  avatar?: string;
  farmId?: string; // set for farmers
  verificationStatus: 'verified' | 'pending' | 'rejected';
  registeredAt: string;
  token?: string;
  phone?: string;
  // Customer details
  address?: string;
  city?: string;
  zipCode?: string;
  deliveryNotes?: string;
  preferredPaymentMethod?: string;
  // Farmer details
  farmName?: string;
  farmLocation?: string;
  certificationNumber?: string;
  primaryCrops?: string[];
  acreage?: number;
  payoutAccount?: string;
}

export type AppRoute =
  | '/login'
  | '/customer-dashboard'
  | '/farmer-dashboard'
  | '/admin-dashboard'
  | '/unauthorized';

export interface CustomerSignUpData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  deliveryNotes?: string;
  preferredPaymentMethod?: 'stripe' | 'ach' | 'apple_pay';
}

export interface FarmerSignUpData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  farmName: string;
  farmLocation: string;
  bio?: string;
  certifiedOrganic: boolean;
  certificationNumber: string;
  primaryCrops: string[];
  acreage?: number;
  payoutMethod?: 'direct_ach' | 'stripe_connect';
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
}

export interface Farm {
  id: string;
  name: string;
  locationName: string;
  coordinates: [number, number]; // [lat, lng]
  contactEmail: string;
  bio: string;
  certifiedOrganic: boolean;
  rating: number;
  avatar: string;
  totalEarnings: number;
}

export interface Product {
  id: string;
  farmId: string;
  farmName: string;
  name: string;
  category: 'Vegetables' | 'Fruits' | 'Dairy & Eggs' | 'Greens & Herbs' | 'Honey & Pantry';
  description: string;
  pricePerUnit: number;
  unit: string;
  stockQuantity: number;
  harvestDate: string;
  location?: string;
  distanceMiles?: number;
  imageUrl: string;
  organic: boolean;
  farmerSharePercentage: number; // e.g. 88
  logisticsSharePercentage: number; // e.g. 7
  platformSharePercentage: number; // e.g. 5
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PriceBreakdown {
  totalAmount: number;
  farmerAmount: number;
  farmerPercentage: number;
  logisticsAmount: number;
  logisticsPercentage: number;
  platformAmount: number;
  platformPercentage: number;
  conventionalRetailFarmerAmount: number; // typical supermarket where farmer receives ~15%
}

export interface OrderItemDetail {
  productId: string;
  productName: string;
  farmId: string;
  farmName: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  grossTotal: number;
  farmerPayout: number;
  logisticsFee: number;
  platformFee: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Dispatched'
  | 'Delivered'
  | 'order_placed'
  | 'batch_consolidated'
  | 'farm_pickup'
  | 'hub_sorting'
  | 'out_for_delivery'
  | 'delivered';

export interface Order {
  id: string;
  createdAt: string;
  buyerName: string;
  buyerAddress: string;
  buyerCoords: [number, number];
  items: OrderItemDetail[];
  totalAmount: number;
  totalFarmerPayout: number;
  status: OrderStatus;
  assignedBatchId?: string;
  deliveryEta: string;
  paymentGateway?: string;
  paymentStatus?: string;
  shippingLabelPrinted?: boolean;
}

export interface TransactionRecord {
  id: string;
  orderId: string;
  buyerName: string;
  farmId: string;
  farmName: string;
  grossAmount: number;
  farmerPayout: number; // 88%
  logisticsCommission: number; // 7%
  platformCommission: number; // 5%
  paymentGateway: 'Stripe' | 'Card' | 'ApplePay';
  paymentStatus: 'succeeded' | 'processing' | 'refunded';
  timestamp: string;
}

export interface ShippingLabelData {
  orderId: string;
  trackingNumber: string;
  batchCode: string;
  farmName: string;
  farmLocation: string;
  recipientName: string;
  recipientAddress: string;
  packageWeight: string;
  handlingInstructions: string;
  coldChainTemperature: string;
  dispatchTimestamp: string;
  itemsSummary: string;
}

export interface FarmerPayoutRecord {
  id: string;
  orderId: string;
  farmId: string;
  productName: string;
  quantity: number;
  unit: string;
  grossAmount: number;
  farmerNetPayout: number;
  payoutRatePercent: number; // 88%
  timestamp: string;
  status: 'settled' | 'processing';
}

export interface LogisticsHub {
  id: string;
  name: string;
  locationName: string;
  coordinates: [number, number];
  capacityBoxes: number;
}

export interface PickupStop {
  id: string;
  farmId: string;
  farmName: string;
  coordinates: [number, number];
  boxCount: number;
  productSummary: string;
  sequenceOrder: number;
  pickedUp: boolean;
}

export interface DeliveryStop {
  orderId: string;
  buyerName: string;
  address: string;
  coordinates: [number, number];
  sequenceOrder: number;
  delivered: boolean;
}

export interface LogisticsBatch {
  id: string;
  batchCode: string;
  hubId: string;
  hubName: string;
  pickupStops: PickupStop[];
  deliveryStops: DeliveryStop[];
  unoptimizedDistanceKm: number;
  optimizedDistanceKm: number;
  distanceSavedKm: number;
  co2ReductionKg: number;
  status: 'scheduled' | 'picking_up' | 'hub_consolidated' | 'delivering' | 'completed';
  activeProgressPercent: number;
  estimatedDurationMins: number;
  driverName: string;
  driverVehicle: string;
}
