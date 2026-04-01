import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryModelsDto } from './dto/query-models.dto';
import { ModelsService } from './models.service';

@ApiTags('Models')
@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get()
  @ApiOperation({ summary: 'Get models with filters' })
  findAll(@Query() query: QueryModelsDto) {
    return this.modelsService.findAll(query);
  }
}
