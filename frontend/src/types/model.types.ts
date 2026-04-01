export interface AiModel {
  _id: string;
  name: string;
  provider: string;
  category: string;
  capabilities: string[];
  tags: string[];
  pricePer1k: number;
  rating: number;
  contextWindow: number;
  isNew?: boolean;
  isHot?: boolean;
}

export interface ModelsResponse {
  data: AiModel[];
  meta: {
    total: number;
    providers: string[];
    capabilities: string[];
  };
}
