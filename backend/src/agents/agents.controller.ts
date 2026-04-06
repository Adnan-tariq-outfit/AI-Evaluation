import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import {
  CreateAgentRequestDto,
  QueryAgentsDto,
  ValidateStepDto,
} from './dto/agent.dto';

@ApiTags('Agents')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  @ApiOperation({ summary: 'List authenticated user agents' })
  findMine(@Query() query: QueryAgentsDto) {
    return this.agentsService.findByUser(query.userId);
  }

  @Post('validate-step')
  @ApiOperation({ summary: 'Validate one step of agent wizard' })
  validateStep(@Body() dto: ValidateStepDto) {
    return this.agentsService.validateStep(dto.step, dto.data);
  }

  @Post()
  @ApiOperation({ summary: 'Create agent from full 6-step wizard payload' })
  @ApiResponse({ status: 201, description: 'Agent created' })
  create(@Body() dto: CreateAgentRequestDto) {
    return this.agentsService.create(dto.userId, dto);
  }
}
