import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AiModel, AiModelSchema } from '../models/schemas/ai-model.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AiModel.name, schema: AiModelSchema }]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
