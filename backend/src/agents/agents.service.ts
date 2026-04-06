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
import { User, UserDocument } from '../users/schemas/user.schema';

type AgentStepRecord = Record<string, unknown>;

type SerializedAgentSource = {
  _id: Types.ObjectId | string;
  name: string;
  description: string;
  category: string;
  status: 'draft' | 'active';
  config: unknown;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private readonly agentModel: Model<AgentDocument>,
    @InjectModel(AiModel.name)
    private readonly aiModelModel: Model<AiModelDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  validateStep(step: number, data: Record<string, unknown>) {
    const classType = this.getStepClass(step);
    const instance = plainToInstance(classType, data);
    const errors = validateSync(instance, {
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
    const userObjectId = await this.requireActiveUser(userId);

    this.validateStep(1, this.toStepRecord(dto.step1));
    this.validateStep(2, this.toStepRecord(dto.step2));
    this.validateStep(3, this.toStepRecord(dto.step3));
    this.validateStep(4, this.toStepRecord(dto.step4));
    this.validateStep(5, this.toStepRecord(dto.step5));
    this.validateStep(6, this.toStepRecord(dto.step6));

    const model = await this.aiModelModel.findById(dto.step4.modelId).lean();
    if (!model) {
      throw new NotFoundException('Selected model does not exist');
    }

    const created = await this.agentModel.create({
      userId: userObjectId,
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

    return this.serializeAgent(
      created.toObject() as unknown as SerializedAgentSource,
    );
  }

  async findByUser(userId: string) {
    const userObjectId = await this.requireActiveUser(userId);

    const data = await this.agentModel
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .lean();

    return {
      data: data.map((agent) =>
        this.serializeAgent(agent as unknown as SerializedAgentSource),
      ),
    };
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

  private serializeAgent(agent: SerializedAgentSource) {
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

  private toStepRecord<T extends object>(value: T): AgentStepRecord {
    return value as AgentStepRecord;
  }

  private async requireActiveUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    const objectId = new Types.ObjectId(userId);
    const user = await this.userModel.findById(objectId).lean();
    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    return objectId;
  }
}
