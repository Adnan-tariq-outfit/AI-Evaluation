import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({ description: 'User message' })
  @IsString()
  @MaxLength(4000)
  message: string;

  @ApiPropertyOptional({ description: 'Selected model id' })
  @IsOptional()
  @IsString()
  modelId?: string;
}
