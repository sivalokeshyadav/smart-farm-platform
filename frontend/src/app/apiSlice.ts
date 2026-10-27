/**
 * Legacy re-export layer for backwards compatibility.
 * All feature endpoints are modularized under src/features/{feature}/services/
 * and base configuration is provided by src/services/baseApi.ts.
 */
import { baseApi } from '../services/baseApi';

export const apiSlice = baseApi;

export * from '../services';
export default apiSlice;
