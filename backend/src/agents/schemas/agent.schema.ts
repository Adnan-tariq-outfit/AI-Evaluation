import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AgentDocument = Agent & Document;

@Schema({ _id: false })
class AgentMemory {
  @Prop({ required: true, min: 1, max: 100 })
  shortTermWindow: number;

  @Prop({ required: true })
  longTermMemory: boolean;

  @Prop({ required: true })
  memorySummary: boolean;
}

@Schema({ _id: false })
class AgentRuntime {
  @Prop({ required: true, min: 0, max: 2 })
  temperature: number;

  @Prop({ required: true, min: 50, max: 8000 })
  maxTokens: number;

  @Prop({ required: true, min: 5, max: 120 })
  timeoutSeconds: number;
}

@Schema({ _id: false })
class AgentConfig {
  @Prop({ required: true, trim: true })
  purpose: string;

  @Prop({ required: true, trim: true })
  primaryGoal: string;

  @Prop({ required: true, trim: true })
  systemPrompt: string;

  @Prop({ required: true, trim: true })
  modelId: string;

  @Prop({ required: true, trim: true })
  modelName: string;

  @Prop({ required: true, trim: true })
  modelProvider: string;

  @Prop({ type: [String], default: [] })
  tools: string[];

  @Prop({ type: AgentMemory, required: true })
  memory: AgentMemory;

  @Prop({ type: AgentRuntime, required: true })
  runtime: AgentRuntime;

  @Prop({ required: true, trim: true })
  fallbackBehavior: string;
}

@Schema({ timestamps: true })
export class Agent {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 80 })
  name: string;

  @Prop({ required: true, trim: true, maxlength: 240 })
  description: string;

  @Prop({ required: true, trim: true, maxlength: 50 })
  category: string;

  @Prop({ default: 'draft', enum: ['draft', 'active'] })
  status: 'draft' | 'active';

  @Prop({ type: AgentConfig, required: true })
  config: AgentConfig;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
