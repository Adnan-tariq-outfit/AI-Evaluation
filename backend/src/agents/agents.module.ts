import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, AgentSchema } from './schemas/agent.schema';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { AiModel, AiModelSchema } from '../models/schemas/ai-model.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Agent.name, schema: AgentSchema },
      { name: AiModel.name, schema: AiModelSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AgentsController],
  providers: [AgentsService],
})
export class AgentsModule {}
