import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryModelsDto {
  @ApiPropertyOptional({ description: 'Search by model name/provider' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by provider' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ description: 'Filter by capability' })
  @IsOptional()
  @IsString()
  capability?: string;

  @ApiPropertyOptional({ description: 'Minimum rating' })
  @IsOptional()
  @IsNumberString()
  minRating?: string;

  @ApiPropertyOptional({ description: 'Maximum price per 1k tokens' })
  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @ApiPropertyOptional({
    description: 'Optional user id to validate before returning models',
  })
  @IsOptional()
  @IsString()
  @IsMongoId()
  userId?: string;
}
