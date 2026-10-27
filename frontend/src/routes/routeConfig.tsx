import React from 'react';
import { ROUTES } from './paths';
import { FarmerDashboard } from '../features/farmer-dashboard/FarmerDashboard';
import { MarketBookingPage } from '../features/markets/MarketBookingPage';
import { IVRSimulatorPage } from '../features/ivrs/IVRSimulatorPage';
import { StaffGateCheckInPage } from '../features/bookings/StaffGateCheckInPage';
import { GodownStoragePage } from '../features/godowns/GodownStoragePage';
import { MarketplacePage } from '../features/marketplace/MarketplacePage';
import { SchemesPage } from '../features/schemes/SchemesPage';
import { CalculatorsPage } from '../features/calculators/CalculatorsPage';
import { CropHealthPage } from '../features/crop-health/CropHealthPage';
import { FieldServicesPage } from '../features/field-services/FieldServicesPage';
import { SupportPage } from '../features/support/SupportPage';
import { AdminConsolePage } from '../features/admin/AdminConsolePage';
import { DailyMandiPricesPage } from '../features/markets/DailyMandiPricesPage';
import { LoginPage } from '../features/auth/LoginPage';
import { NotFoundPage } from './NotFoundPage';

export interface AppRoute {
  path: string;
  element: React.ReactElement;
  title: string;
  allowedRoles?: string[];
}

export const ROLE_ROUTE_PERMISSIONS: Record<string, string[]> = {
  [ROUTES.HOME]: [
    'FARMER',
    'CROP_BUYER',
    'CROP_SELLER',
    'LIVESTOCK_BUYER',
    'LIVESTOCK_SELLER',
    'EQUIPMENT_BUYER',
    'EQUIPMENT_SELLER',
    'VETERINARIAN',
    'MARKET_STAFF',
    'GODOWN_OPERATOR',
    'DELIVERY_WORKER',
    'HELP_DESK_OPERATOR',
    'ADMIN',
  ],
  [ROUTES.MARKETS]: ['FARMER', 'CROP_SELLER', 'MARKET_STAFF', 'ADMIN'],
  [ROUTES.IVR]: ['FARMER', 'HELP_DESK_OPERATOR', 'ADMIN'],
  [ROUTES.STAFF]: ['MARKET_STAFF', 'GODOWN_OPERATOR', 'HELP_DESK_OPERATOR', 'ADMIN'],
  [ROUTES.GODOWNS]: ['FARMER', 'CROP_SELLER', 'CROP_BUYER', 'GODOWN_OPERATOR', 'ADMIN'],
  [ROUTES.MARKETPLACE]: [
    'FARMER',
    'CROP_BUYER',
    'CROP_SELLER',
    'LIVESTOCK_BUYER',
    'LIVESTOCK_SELLER',
    'EQUIPMENT_BUYER',
    'EQUIPMENT_SELLER',
    'DELIVERY_WORKER',
    'ADMIN',
  ],
  [ROUTES.SCHEMES]: ['FARMER', 'LIVESTOCK_SELLER', 'HELP_DESK_OPERATOR', 'ADMIN'],
  [ROUTES.CALCULATORS]: ['FARMER', 'CROP_SELLER', 'CROP_BUYER', 'ADMIN'],
  [ROUTES.CROP_HEALTH]: ['FARMER', 'CROP_SELLER', 'HELP_DESK_OPERATOR', 'ADMIN'],
  [ROUTES.FIELD_SERVICES]: [
    'FARMER',
    'LIVESTOCK_BUYER',
    'LIVESTOCK_SELLER',
    'VETERINARIAN',
    'EQUIPMENT_SELLER',
    'DELIVERY_WORKER',
    'ADMIN',
  ],
  [ROUTES.SUPPORT]: [
    'FARMER',
    'CROP_BUYER',
    'CROP_SELLER',
    'LIVESTOCK_BUYER',
    'LIVESTOCK_SELLER',
    'EQUIPMENT_BUYER',
    'EQUIPMENT_SELLER',
    'VETERINARIAN',
    'MARKET_STAFF',
    'GODOWN_OPERATOR',
    'HELP_DESK_OPERATOR',
    'ADMIN',
  ],
  [ROUTES.PRICES]: [
    'FARMER',
    'CROP_BUYER',
    'CROP_SELLER',
    'LIVESTOCK_BUYER',
    'LIVESTOCK_SELLER',
    'EQUIPMENT_BUYER',
    'EQUIPMENT_SELLER',
    'VETERINARIAN',
    'MARKET_STAFF',
    'GODOWN_OPERATOR',
    'DELIVERY_WORKER',
    'HELP_DESK_OPERATOR',
    'ADMIN',
  ],
  [ROUTES.ADMIN]: ['ADMIN'],
  [ROUTES.LOGIN]: [
    'FARMER',
    'CROP_BUYER',
    'CROP_SELLER',
    'LIVESTOCK_BUYER',
    'LIVESTOCK_SELLER',
    'EQUIPMENT_BUYER',
    'EQUIPMENT_SELLER',
    'VETERINARIAN',
    'MARKET_STAFF',
    'GODOWN_OPERATOR',
    'DELIVERY_WORKER',
    'HELP_DESK_OPERATOR',
    'ADMIN',
  ],
};

export const appRoutesConfig: AppRoute[] = [
  {
    path: ROUTES.HOME,
    element: <FarmerDashboard />,
    title: 'Farmer Dashboard ',
    allowedRoles: ROLE_ROUTE_PERMISSIONS[ROUTES.HOME],
  },
  {
    path: ROUTES.MARKETS,
    element: <MarketBookingPage />,
    title: 'Slot Booking ',
    allowedRoles: ROLE_ROUTE_PERMISSIONS[ROUTES.MARKETS],
  },
  {
    path: ROUTES.PRICES,
    element: <DailyMandiPricesPage />,
    title: 'Daily Mandi Prices ',
    allowedRoles: ROLE_ROUTE_PERMISSIONS[ROUTES.PRICES],
  },
  {
    path: ROUTES.IVR,
    element: <IVRSimulatorPage />,
    title: 'IVR Simulator ',
    allowedRoles: ROLE_ROUTE_PERMISSIONS[ROUTES.IVR],
  },
  {
    path: ROUTES.STAFF,
    element: <StaffGateCheckInPage />,
    title: 'Staff Gate Pass ',
    allowedRoles: ROLE_ROUTE_PERMISSIONS[ROUTES.STAFF],
  },
  {
    path: ROUTES.GODOWNS,
    element: <GodownStoragePage />,
    title: 'Godown Storage ',
    allowedRoles: ROLE_ROUTE_PERMISSIONS[ROUTES.GODOWNS],
  },
  {
    path: ROUTES.MARKETPLACE,
    element: <MarketplacePage />,
    title: 'Marketplace ',
    allowedRoles: ROLE_ROUTE_PERMISSIONS[ROUTES.MARKETPLACE],
  },
  {
    path: ROUTES.SCHEMES,
    element: <SchemesPage />,
    title: 'Government Schemes ',
    allowedRoles: ROLE_ROUTE_PERMISSIONS[ROUTES.SCHEMES],
  },
  {
    path: ROUTES.CALCULATORS,
    element: <CalculatorsPage />,
    title: 'Agri Calculators ',
    allowedRoles: ROLE_ROUTE_PERMISSIONS[ROUTES.CALCULATORS],
  },
  {
    path: ROUTES.CROP_HEALTH,
    element: <CropHealthPage />,
    title: 'Crop Health AI ',
    allowedRoles: ROLE_ROUTE_PERMISSIONS[ROUTES.CROP_HEALTH],
  },
  {
    path: ROUTES.FIELD_SERVICES,
    element: <FieldServicesPage />,
    title: 'Field Services & Vet Visits ',
    allowedRoles: ROLE_ROUTE_PERMISSIONS[ROUTES.FIELD_SERVICES],
  },
  {
    path: ROUTES.SUPPORT,
    element: <SupportPage />,
    title: 'Support & Grievance ',
    allowedRoles: ROLE_ROUTE_PERMISSIONS[ROUTES.SUPPORT],
  },
  {
    path: ROUTES.ADMIN,
    element: <AdminConsolePage />,
    title: 'Admin Console ',
    allowedRoles: ROLE_ROUTE_PERMISSIONS[ROUTES.ADMIN],
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
    title: 'Login ',
    allowedRoles: ROLE_ROUTE_PERMISSIONS[ROUTES.LOGIN],
  },
  {
    path: '*',
    element: <NotFoundPage />,
    title: 'Not Found ',
  },
];
