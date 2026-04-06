import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';
import { AiModel, AiModelSchema } from './schemas/ai-model.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiModel.name, schema: AiModelSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService],
})
export class ModelsModule {}
