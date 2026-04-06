import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AiModel, AiModelDocument } from './schemas/ai-model.schema';
import { QueryModelsDto } from './dto/query-models.dto';
import { User, UserDocument } from '../users/schemas/user.schema';

type ModelCondition = Record<string, unknown>;

type ModelFilter = {
  isActive: boolean;
  $or?: ModelCondition[];
  provider?: string;
  capabilities?: string;
  $and?: ModelCondition[];
};

@Injectable()
export class ModelsService implements OnModuleInit {
  constructor(
    @InjectModel(AiModel.name) private aiModelModel: Model<AiModelDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    for (const model of seedModels) {
      await this.aiModelModel.updateOne(
        { name: model.name },
        { $setOnInsert: model },
        { upsert: true },
      );
    }
  }

  async findAll(query: QueryModelsDto) {
    if (query.userId) {
      await this.requireActiveUser(query.userId);
    }

    const filter: ModelFilter = { isActive: true };

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { provider: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.provider) {
      filter.provider = query.provider;
    }

    if (query.capability) {
      filter.capabilities = query.capability;
    }

    if (query.minRating || query.maxPrice) {
      filter.$and = [];
      if (query.minRating) {
        filter.$and.push({ rating: { $gte: Number(query.minRating) } });
      }
      if (query.maxPrice) {
        filter.$and.push({ pricePer1k: { $lte: Number(query.maxPrice) } });
      }
    }

    const data = await this.aiModelModel
      .find(filter)
      .sort({ isHot: -1, isNew: -1, rating: -1, name: 1 })
      .lean();

    const providers = await this.aiModelModel.distinct('provider', {
      isActive: true,
    });
    const capabilities = await this.aiModelModel.distinct('capabilities', {
      isActive: true,
    });

    return { data, meta: { total: data.length, providers, capabilities } };
  }

  private async requireActiveUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    const user = await this.userModel
      .findById(new Types.ObjectId(userId))
      .lean();
    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }
  }
}

const seedModels: Partial<AiModel>[] = [
  {
    name: 'GPT-5',
    provider: 'OpenAI',
    category: 'General',
    capabilities: ['reasoning', 'coding', 'multimodal'],
    tags: ['popular', 'agents'],
    pricePer1k: 75,
    rating: 4.9,
    contextWindow: 128000,
    isHot: true,
  },
  {
    name: 'GPT-4.1',
    provider: 'OpenAI',
    category: 'General',
    capabilities: ['reasoning', 'instruction'],
    tags: ['stable'],
    pricePer1k: 52,
    rating: 4.7,
    contextWindow: 128000,
  },
  {
    name: 'Claude Opus 4.5',
    provider: 'Anthropic',
    category: 'Reasoning',
    capabilities: ['analysis', 'long-context'],
    tags: ['premium'],
    pricePer1k: 80,
    rating: 4.8,
    contextWindow: 200000,
  },
  {
    name: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    category: 'Balanced',
    capabilities: ['coding', 'fast'],
    tags: ['new'],
    pricePer1k: 48,
    rating: 4.6,
    contextWindow: 200000,
    isNew: true,
  },
  {
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    category: 'Multimodal',
    capabilities: ['vision', 'reasoning', 'video'],
    tags: ['multimodal'],
    pricePer1k: 58,
    rating: 4.7,
    contextWindow: 1000000,
  },
  {
    name: 'DeepSeek-R1',
    provider: 'DeepSeek',
    category: 'Reasoning',
    capabilities: ['reasoning', 'math'],
    tags: ['budget'],
    pricePer1k: 15,
    rating: 4.4,
    contextWindow: 128000,
  },
  {
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    category: 'Open Source',
    capabilities: ['chat', 'coding'],
    tags: ['opensource'],
    pricePer1k: 10,
    rating: 4.2,
    contextWindow: 128000,
  },
  {
    name: 'Mistral Large',
    provider: 'Mistral',
    category: 'General',
    capabilities: ['chat', 'analysis'],
    tags: ['eu'],
    pricePer1k: 22,
    rating: 4.3,
    contextWindow: 128000,
  },
  {
    name: 'GPT-5.2',
    provider: 'OpenAI',
    category: 'General',
    capabilities: ['reasoning', 'agents', 'coding'],
    tags: ['new'],
    pricePer1k: 65,
    rating: 4.8,
    contextWindow: 256000,
    isNew: true,
  },
  {
    name: 'GPT-5 Turbo',
    provider: 'OpenAI',
    category: 'High Volume',
    capabilities: ['chat', 'cost-efficient'],
    tags: ['hot'],
    pricePer1k: 20,
    rating: 4.8,
    contextWindow: 128000,
    isHot: true,
  },
  {
    name: 'GPT-4.5',
    provider: 'OpenAI',
    category: 'Creative',
    capabilities: ['creative', 'long-form', 'language'],
    tags: ['popular'],
    pricePer1k: 39,
    rating: 4.7,
    contextWindow: 128000,
  },
  {
    name: 'GPT-4.1 Mini',
    provider: 'OpenAI',
    category: 'Fast',
    capabilities: ['chat', 'affordable'],
    tags: ['budget'],
    pricePer1k: 40,
    rating: 4.5,
    contextWindow: 64000,
  },
  {
    name: 'GPT-4o',
    provider: 'OpenAI',
    category: 'Multimodal',
    capabilities: ['vision', 'audio', 'realtime'],
    tags: ['multimodal'],
    pricePer1k: 25,
    rating: 4.7,
    contextWindow: 128000,
  },
  {
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    category: 'Affordable',
    capabilities: ['fast', 'chat', 'lightweight'],
    tags: ['budget'],
    pricePer1k: 8,
    rating: 4.5,
    contextWindow: 64000,
  },
  {
    name: 'o3',
    provider: 'OpenAI',
    category: 'Reasoning',
    capabilities: ['reasoning', 'math', 'planning'],
    tags: ['hot'],
    pricePer1k: 15,
    rating: 4.8,
    contextWindow: 128000,
    isHot: true,
  },
  {
    name: 'o3 Mini',
    provider: 'OpenAI',
    category: 'Reasoning',
    capabilities: ['reasoning', 'cost-efficient'],
    tags: ['budget'],
    pricePer1k: 10,
    rating: 4.6,
    contextWindow: 128000,
  },
  {
    name: 'o4 Mini',
    provider: 'OpenAI',
    category: 'Compact',
    capabilities: ['reasoning', 'compact'],
    tags: ['new'],
    pricePer1k: 10,
    rating: 4.5,
    contextWindow: 128000,
    isNew: true,
  },
  {
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    category: 'Reasoning',
    capabilities: ['coding', 'extended-thinking'],
    tags: ['premium'],
    pricePer1k: 82,
    rating: 4.9,
    contextWindow: 200000,
    isHot: true,
  },
  {
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    category: 'Analysis',
    capabilities: ['analysis', 'documents', 'writing'],
    tags: ['stable'],
    pricePer1k: 76,
    rating: 4.7,
    contextWindow: 200000,
  },
  {
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    category: 'Balanced',
    capabilities: ['chat', 'coding', 'fast'],
    tags: ['popular'],
    pricePer1k: 35,
    rating: 4.7,
    contextWindow: 200000,
  },
  {
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    category: 'Multimodal',
    capabilities: ['vision', 'audio', 'long-context'],
    tags: ['stable'],
    pricePer1k: 32,
    rating: 4.6,
    contextWindow: 1000000,
  },
  {
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    category: 'Fast',
    capabilities: ['fast', 'multimodal'],
    tags: ['budget'],
    pricePer1k: 12,
    rating: 4.4,
    contextWindow: 1000000,
  },
  {
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    category: 'Fast',
    capabilities: ['speed', 'vision', 'chat'],
    tags: ['new'],
    pricePer1k: 10,
    rating: 4.5,
    contextWindow: 1000000,
    isNew: true,
  },
  {
    name: 'Llama 3.1 405B',
    provider: 'Meta',
    category: 'Open Source',
    capabilities: ['reasoning', 'long-context'],
    tags: ['opensource'],
    pricePer1k: 18,
    rating: 4.3,
    contextWindow: 128000,
  },
  {
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    category: 'Open Source',
    capabilities: ['chat', 'code'],
    tags: ['opensource'],
    pricePer1k: 12,
    rating: 4.2,
    contextWindow: 128000,
  },
  {
    name: 'Mistral Small',
    provider: 'Mistral',
    category: 'Budget',
    capabilities: ['chat', 'lightweight'],
    tags: ['budget'],
    pricePer1k: 9,
    rating: 4.1,
    contextWindow: 32000,
  },
  {
    name: 'Mistral Nemo',
    provider: 'Mistral',
    category: 'Fast',
    capabilities: ['coding', 'chat'],
    tags: ['new'],
    pricePer1k: 11,
    rating: 4.2,
    contextWindow: 128000,
  },
  {
    name: 'DeepSeek-V3',
    provider: 'DeepSeek',
    category: 'General',
    capabilities: ['coding', 'analysis'],
    tags: ['value'],
    pricePer1k: 8,
    rating: 4.4,
    contextWindow: 128000,
  },
  {
    name: 'DeepSeek-Coder',
    provider: 'DeepSeek',
    category: 'Coding',
    capabilities: ['coding', 'debugging'],
    tags: ['popular'],
    pricePer1k: 7,
    rating: 4.3,
    contextWindow: 64000,
  },
  {
    name: 'Qwen 2.5 Max',
    provider: 'Alibaba (Qwen)',
    category: 'General',
    capabilities: ['chat', 'reasoning'],
    tags: ['new'],
    pricePer1k: 19,
    rating: 4.4,
    contextWindow: 128000,
  },
  {
    name: 'Qwen2.5 Coder',
    provider: 'Alibaba (Qwen)',
    category: 'Coding',
    capabilities: ['coding', 'agents'],
    tags: ['popular'],
    pricePer1k: 14,
    rating: 4.5,
    contextWindow: 128000,
  },
  {
    name: 'Grok 2',
    provider: 'X AI / Grok',
    category: 'General',
    capabilities: ['realtime', 'humor'],
    tags: ['hot'],
    pricePer1k: 28,
    rating: 4.2,
    contextWindow: 128000,
    isHot: true,
  },
  {
    name: 'Grok 2 Mini',
    provider: 'X AI / Grok',
    category: 'Fast',
    capabilities: ['chat', 'speed'],
    tags: ['budget'],
    pricePer1k: 13,
    rating: 4.0,
    contextWindow: 64000,
  },
  {
    name: 'Cohere Command R+',
    provider: 'Cohere',
    category: 'Enterprise',
    capabilities: ['rag', 'documents'],
    tags: ['enterprise'],
    pricePer1k: 24,
    rating: 4.3,
    contextWindow: 128000,
  },
  {
    name: 'Cohere Command R',
    provider: 'Cohere',
    category: 'Enterprise',
    capabilities: ['rag', 'chat'],
    tags: ['enterprise'],
    pricePer1k: 18,
    rating: 4.2,
    contextWindow: 128000,
  },
  {
    name: 'Phi-4',
    provider: 'Microsoft',
    category: 'Compact',
    capabilities: ['reasoning', 'compact'],
    tags: ['new'],
    pricePer1k: 11,
    rating: 4.1,
    contextWindow: 64000,
    isNew: true,
  },
  {
    name: 'Nemotron-4 340B',
    provider: 'NVIDIA',
    category: 'Reasoning',
    capabilities: ['reasoning', 'science'],
    tags: ['research'],
    pricePer1k: 30,
    rating: 4.2,
    contextWindow: 128000,
  },
  {
    name: 'Luminous Supreme',
    provider: 'Aleph Alpha',
    category: 'Enterprise',
    capabilities: ['compliance', 'multilingual'],
    tags: ['eu'],
    pricePer1k: 27,
    rating: 4.0,
    contextWindow: 64000,
  },
  {
    name: 'Jamba 1.6 Large',
    provider: 'AI21 Labs',
    category: 'Long Context',
    capabilities: ['long-context', 'analysis'],
    tags: ['enterprise'],
    pricePer1k: 23,
    rating: 4.1,
    contextWindow: 256000,
  },
  {
    name: 'Nova Pro',
    provider: 'Amazon',
    category: 'General',
    capabilities: ['chat', 'enterprise'],
    tags: ['new'],
    pricePer1k: 21,
    rating: 4.1,
    contextWindow: 128000,
  },
  {
    name: 'Nova Lite',
    provider: 'Amazon',
    category: 'Fast',
    capabilities: ['speed', 'chat'],
    tags: ['budget'],
    pricePer1k: 10,
    rating: 4.0,
    contextWindow: 64000,
  },
  {
    name: 'Baidu ERNIE 4.0',
    provider: 'Baidu',
    category: 'General',
    capabilities: ['multilingual', 'chat'],
    tags: ['regional'],
    pricePer1k: 14,
    rating: 3.9,
    contextWindow: 64000,
  },
];
