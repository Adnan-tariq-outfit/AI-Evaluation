import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { AgentsService } from './agents.service';
import { CreateAgentDto, ValidateStepDto } from './dto/agent.dto';

interface RequestWithUser extends Request {
  user: RequestUser;
}

@ApiTags('Agents')
@Controller('agents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  @ApiOperation({ summary: 'List authenticated user agents' })
  findMine(@Req() req: RequestWithUser) {
    return this.agentsService.findByUser(req.user.userId);
  }

  @Post('validate-step')
  @ApiOperation({ summary: 'Validate one step of agent wizard' })
  validateStep(@Body() dto: ValidateStepDto) {
    return this.agentsService.validateStep(dto.step, dto.data);
  }

  @Post()
  @ApiOperation({ summary: 'Create agent from full 6-step wizard payload' })
  @ApiResponse({ status: 201, description: 'Agent created' })
  create(@Req() req: RequestWithUser, @Body() dto: CreateAgentDto) {
    return this.agentsService.create(req.user.userId, dto);
  }
}
