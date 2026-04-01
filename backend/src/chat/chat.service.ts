import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiModel, AiModelDocument } from '../models/schemas/ai-model.schema';
import { ChatRequestDto } from './dto/chat-request.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(AiModel.name) private aiModelModel: Model<AiModelDocument>,
  ) {}

  async simulate(data: ChatRequestDto) {
    const model = data.modelId
      ? await this.aiModelModel.findById(data.modelId).lean()
      : null;

    const header = model
      ? `Using ${model.name} by ${model.provider}:`
      : 'Using simulated assistant:';

    return {
      reply: `${header}\n\nI understood your request: "${data.message}".\n\nSuggested next steps:\n1) Define expected output format.\n2) Provide sample input data.\n3) Confirm constraints (budget, latency, quality).\n\nOnce you share those, I can generate a more precise answer.`,
      model: model
        ? {
            id: model._id.toString(),
            name: model.name,
            provider: model.provider,
          }
        : null,
      timestamp: new Date().toISOString(),
    };
  }
}
