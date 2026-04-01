import axios from 'axios';
import { ModelsResponse } from '../types/model.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ModelFilters {
  search?: string;
  provider?: string;
  capability?: string;
  minRating?: number;
  maxPrice?: number;
}

export class ModelService {
  static async getModels(filters: ModelFilters = {}): Promise<ModelsResponse> {
    const params: Record<string, string | number> = {};

    if (filters.search) params.search = filters.search;
    if (filters.provider) params.provider = filters.provider;
    if (filters.capability) params.capability = filters.capability;
    if (typeof filters.minRating === 'number') params.minRating = filters.minRating;
    if (typeof filters.maxPrice === 'number') params.maxPrice = filters.maxPrice;

    const response = await axios.get<ModelsResponse>(`${API_URL}/models`, { params });
    return response.data;
  }
}
