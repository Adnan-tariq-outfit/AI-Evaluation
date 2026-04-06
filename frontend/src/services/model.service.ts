import { ModelsResponse } from '../types/model.types';
import { publicApiClient } from '../lib/api';

export interface ModelFilters {
  search?: string;
  provider?: string;
  capability?: string;
  minRating?: number;
  maxPrice?: number;
  userId?: string;
}

export class ModelService {
  static async getModels(filters: ModelFilters = {}): Promise<ModelsResponse> {
    const params: Record<string, string | number> = {};

    if (filters.search) params.search = filters.search;
    if (filters.provider) params.provider = filters.provider;
    if (filters.capability) params.capability = filters.capability;
    if (typeof filters.minRating === 'number') params.minRating = filters.minRating;
    if (typeof filters.maxPrice === 'number') params.maxPrice = filters.maxPrice;
    if (filters.userId) params.userId = filters.userId;

    const response = await publicApiClient.get<ModelsResponse>('/models', { params });
    return response.data;
  }
}
