import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import {
  CreateAgentDto,
  Step1BasicsDto,
  Step2PurposeDto,
  Step3PromptDto,
  Step4ModelDto,
  Step5MemoryDto,
  Step6RuntimeDto,
} from './dto/agent.dto';
import { Agent, AgentDocument } from './schemas/agent.schema';
import { AiModel, AiModelDocument } from '../models/schemas/ai-model.schema';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private readonly agentModel: Model<AgentDocument>,
    @InjectModel(AiModel.name) private readonly aiModelModel: Model<AiModelDocument>,
  ) {}

  validateStep(step: number, data: Record<string, unknown>) {
    const classType = this.getStepClass(step);
    const instance = plainToInstance(classType, data);
    const errors = validateSync(instance as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length) {
      throw new BadRequestException(
        errors
          .map((err) => Object.values(err.constraints ?? {}).join(', '))
          .filter(Boolean)
          .join(' | ') || `Invalid data for step ${step}`,
      );
    }

    return {
      step,
      valid: true,
      normalizedData: instance,
    };
  }

  async create(userId: string, dto: CreateAgentDto) {
    this.validateStep(1, dto.step1 as unknown as Record<string, unknown>);
    this.validateStep(2, dto.step2 as unknown as Record<string, unknown>);
    this.validateStep(3, dto.step3 as unknown as Record<string, unknown>);
    this.validateStep(4, dto.step4 as unknown as Record<string, unknown>);
    this.validateStep(5, dto.step5 as unknown as Record<string, unknown>);
    this.validateStep(6, dto.step6 as unknown as Record<string, unknown>);

    const model = await this.aiModelModel.findById(dto.step4.modelId).lean();
    if (!model) {
      throw new NotFoundException('Selected model does not exist');
    }

    const created = await this.agentModel.create({
      userId: new Types.ObjectId(userId),
      name: dto.step1.name.trim(),
      description: dto.step1.description.trim(),
      category: dto.step1.category.trim(),
      status: 'draft',
      config: {
        purpose: dto.step2.purpose.trim(),
        primaryGoal: dto.step2.primaryGoal.trim(),
        systemPrompt: dto.step3.systemPrompt.trim(),
        modelId: model._id.toString(),
        modelName: model.name,
        modelProvider: model.provider,
        tools: (dto.step4.tools ?? []).map((tool) => tool.trim()),
        memory: {
          shortTermWindow: dto.step5.shortTermWindow,
          longTermMemory: dto.step5.longTermMemory,
          memorySummary: dto.step5.memorySummary,
        },
        runtime: {
          temperature: dto.step6.temperature,
          maxTokens: dto.step6.maxTokens,
          timeoutSeconds: dto.step6.timeoutSeconds,
        },
        fallbackBehavior: dto.step6.fallbackBehavior.trim(),
      },
    });

    return this.serializeAgent(created.toObject());
  }

  async findByUser(userId: string) {
    const data = await this.agentModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    return { data: data.map((agent) => this.serializeAgent(agent)) };
  }

  private getStepClass(step: number) {
    const stepMap = {
      1: Step1BasicsDto,
      2: Step2PurposeDto,
      3: Step3PromptDto,
      4: Step4ModelDto,
      5: Step5MemoryDto,
      6: Step6RuntimeDto,
    } as const;

    const classType = stepMap[step as keyof typeof stepMap];
    if (!classType) {
      throw new BadRequestException('Unknown step');
    }
    return classType as new () => object;
  }

  private serializeAgent(agent: any) {
    return {
      _id: agent._id.toString(),
      name: agent.name,
      description: agent.description,
      category: agent.category,
      status: agent.status,
      config: agent.config,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };
  }
}
