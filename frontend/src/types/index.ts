export type UserRole =
  | 'FARMER'
  | 'CROP_BUYER'
  | 'CROP_SELLER'
  | 'LIVESTOCK_BUYER'
  | 'LIVESTOCK_SELLER'
  | 'EQUIPMENT_BUYER'
  | 'EQUIPMENT_SELLER'
  | 'VETERINARIAN'
  | 'MARKET_STAFF'
  | 'GODOWN_OPERATOR'
  | 'DELIVERY_WORKER'
  | 'HELP_DESK_OPERATOR'
  | 'ADMIN';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  roles?: UserRole[];
  pendingRoles?: string[];
  state?: string;
  district?: string;
  mandal?: string;
  village?: string;
  preferredLanguage?: 'en' | 'te' | 'hi';
  isActive?: boolean;
}

export interface StatusHistoryItem {
  fromStatus?: string | null;
  toStatus: string;
  timestamp: string;
  actorId?: string;
  actorRole?: string;
  actorName?: string;
  notes?: string;
  evidence?: Record<string, any>;
  customerConfirmation?: boolean;
}

export interface Market {
  id: string;
  _id?: string;
  name: string;
  nameTe: string;
  district: string;
  mandal: string;
  location: string;
  operatingHours: string;
  commoditiesSupported: string[];
  maxDailyVehicles: number;
  isActive: boolean;
}

export interface MarketSlot {
  id: string;
  _id?: string;
  marketId: string;
  date: string;
  slotTime: string;
  commodity: string;
  totalCapacityVehicles: number;
  bookedVehicles: number;
  availableVehicles?: number;
  isFull?: boolean;
}

export interface Booking {
  id: string;
  _id?: string;
  bookingReference: string;
  farmerId: string;
  farmerPhone: string;
  farmerName: string;
  marketId: string;
  marketName: string;
  marketNameTe?: string;
  date: string;
  slotTime: string;
  commodity: string;
  vehicleType: string;
  estimatedQuantityQuintals: number;
  status: 'BOOKED' | 'ENTERED' | 'RATE_NEGOTIATION' | 'LOADING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | 'NO_SHOW';
  channel: 'WEB' | 'IVR' | 'FIELD_AGENT';
  bookedAt: string;
  checkedInAt?: string;
  idempotencyKey?: string;
  negotiation?: {
    traderName: string;
    agreedRatePerQuintal: number;
  };
  statusHistory?: StatusHistoryItem[];
}

export interface Godown {
  id: string;
  _id?: string;
  name: string;
  nameTe: string;
  district: string;
  mandal: string;
  address: string;
  totalCapacityBags: number;
  availableCapacityBags: number;
  eligibleCommodities: string[];
  unitPricePerMonthPerBag: number;
  operatingHours: string;
  contactPhone: string;
  isVerified: boolean;
}

export interface GodownReservation {
  id: string;
  _id?: string;
  reservationReference: string;
  farmerId: string;
  farmerName: string;
  godownId: string;
  godownName: string;
  godownNameTe?: string;
  commodity: string;
  bagsCount: number;
  durationMonths: number;
  startDate: string;
  totalEstimatedCost: number;
  status: string;
  createdAt: string;
}

export interface Product {
  id: string;
  _id?: string;
  sellerId: string;
  sellerBusinessName: string;
  category: 'SEEDS' | 'FERTILIZERS' | 'TOOLS' | 'PESTICIDES';
  name: string;
  nameTe: string;
  brand: string;
  price: number;
  unit: string;
  stockQuantity: number;
  requiresLicense: boolean;
  description: string;
}

export interface Scheme {
  id: string;
  _id?: string;
  schemeCode: string;
  officialName?: string;
  title: string;
  titleTe: string;
  titleHi?: string;
  jurisdiction: 'CENTRAL' | 'STATE';
  category: string;
  subCategory?: string;
  applicableStates?: string[];
  applicableDistricts?: string[];
  eligibilitySummary: string;
  eligibilitySummaryTe: string;
  maxLandHoldingAcres?: number;
  tenantEligible: boolean;
  benefits: string;
  benefitsTe: string;
  subsidyPercent?: string;
  officialSourceUrl: string;
  requiredDocuments: string[];
  lastVerifiedDate?: string;
  verificationStatus?: string;
  isActive: boolean;
}

export interface SchemeCase {
  id: string;
  _id?: string;
  caseReference: string;
  farmerId: string;
  farmerPhone: string;
  farmerName?: string;
  schemeId: string;
  schemeTitle: string;
  officialName?: string;
  operatorId?: string;
  operatorName?: string;
  status: string;
  documentChecklist: { name: string; submitted: boolean }[];
  notes?: string;
  statusHistory?: StatusHistoryItem[];
  createdAt: string;
}

export interface FieldService {
  id: string;
  _id?: string;
  serviceType: 'VETERINARY' | 'EQUIPMENT_DELIVERY' | 'FIELD_INSPECTION' | 'SCHEME_ASSISTANCE';
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime?: string;
  farmLocation: string;
  mandal?: string;
  district?: string;
  state?: string;
  contactPhone: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  status: string;
  assignedProviderId?: string;
  assignedProviderName?: string;
  assignedProviderRole?: string;
  statusHistory?: StatusHistoryItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface Feedback {
  id: string;
  _id?: string;
  module: string;
  transactionId: string;
  targetId?: string;
  targetName?: string;
  raterId: string;
  raterName: string;
  raterRole: string;
  rating: number;
  reviewText?: string;
  tags: string[];
  status: 'PUBLISHED' | 'FLAGGED' | 'REMOVED';
  createdAt: string;
}

export interface WeatherData {
  mandal: string;
  temperatureC: number;
  humidityPercent: number;
  rainfallMm: number;
  condition: string;
  conditionTe: string;
  advisory: string;
}

export interface MandiPrice {
  commodity: string;
  commodityTe: string;
  variety: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}
