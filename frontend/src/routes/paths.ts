export const ROUTES = {
  HOME: '/',
  MARKETS: '/markets',
  IVR: '/ivr',
  STAFF: '/staff',
  GODOWNS: '/godowns',
  MARKETPLACE: '/marketplace',
  SCHEMES: '/schemes',
  CALCULATORS: '/calculators',
  CROP_HEALTH: '/crop-health',
  FIELD_SERVICES: '/field-services',
  PRICES: '/market-prices',
  SUPPORT: '/support',
  ADMIN: '/admin',
  LOGIN: '/login',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
