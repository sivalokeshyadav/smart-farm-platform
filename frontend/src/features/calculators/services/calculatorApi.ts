import { baseApi } from '../../../services/baseApi';

export interface GpsCoordinate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  label?: string;
}

export interface GpsEdgeDetail {
  fromPoint: number;
  toPoint: number;
  distanceMeters: number;
  distanceFeet: number;
}

export interface GpsFencingEstimate {
  perimeterMeters: number;
  perimeterFeet: number;
  poleSpacingFeet: number;
  wireStrands: number;
  totalPolesNeeded: number;
  cornerPoles: number;
  totalWireLengthMeters: number;
  wireRollsEstimated: number;
}

export interface GpsLandAreaRequest {
  coordinates: GpsCoordinate[];
  fencePoleSpacingFeet?: number;
  fenceWireStrands?: number;
}

export interface GpsLandAreaResponse {
  totalPoints: number;
  areaSqMeters: number;
  areaAcres: number;
  areaCents: number;
  areaGuntas: number;
  areaHectares: number;
  areaSqFeet: number;
  areaSqYards: number;
  perimeterMeters: number;
  perimeterFeet: number;
  edges: GpsEdgeDetail[];
  centroid: { latitude: number; longitude: number };
  fencing: GpsFencingEstimate;
  regionalSummary: string;
}

export const calculatorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    convertLand: builder.mutation<any, { value: number; fromUnit: string }>({
      query: (body) => ({
        url: '/calculators/land-convert',
        method: 'POST',
        body,
      }),
    }),
    calculateGpsLandArea: builder.mutation<GpsLandAreaResponse, GpsLandAreaRequest>({
      query: (body) => ({
        url: '/calculators/gps-land-area',
        method: 'POST',
        body,
      }),
    }),
    calculateSeedFertilizer: builder.mutation<any, { crop: string; acres: number; farmingMethod: string }>({
      query: (body) => ({
        url: '/calculators/seed-fertilizer',
        method: 'POST',
        body,
      }),
    }),
    calculateYieldMargin: builder.mutation<any, any>({
      query: (body) => ({
        url: '/calculators/yield-margin',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useConvertLandMutation,
  useCalculateGpsLandAreaMutation,
  useCalculateSeedFertilizerMutation,
  useCalculateYieldMarginMutation,
} = calculatorApi;

