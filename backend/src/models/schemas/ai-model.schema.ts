import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AiModelDocument = AiModel & Document;

@Schema({ timestamps: true })
export class AiModel {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, index: true })
  provider: string;

  @Prop({ required: true, trim: true, index: true })
  category: string;

  @Prop({ type: [String], default: [] })
  capabilities: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true, min: 0 })
  pricePer1k: number;

  @Prop({ required: true, min: 0, max: 5, index: true })
  rating: number;

  @Prop({ required: true, min: 0 })
  contextWindow: number;

  @Prop({ default: false })
  isNew: boolean;

  @Prop({ default: false })
  isHot: boolean;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const AiModelSchema = SchemaFactory.createForClass(AiModel);
