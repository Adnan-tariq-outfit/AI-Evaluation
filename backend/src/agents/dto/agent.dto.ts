import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class Step1BasicsDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(240)
  description: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  category: string;
}

export class Step2PurposeDto {
  @ApiProperty()
  @IsString()
  @MinLength(12)
  @MaxLength(300)
  purpose: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(220)
  primaryGoal: string;
}

export class Step3PromptDto {
  @ApiProperty()
  @IsString()
  @MinLength(20)
  @MaxLength(4000)
  systemPrompt: string;
}

export class Step4ModelDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  modelId: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  @IsOptional()
  tools?: string[];
}

export class Step5MemoryDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(100)
  shortTermWindow: number;

  @ApiProperty()
  @IsBoolean()
  longTermMemory: boolean;

  @ApiProperty()
  @IsBoolean()
  memorySummary: boolean;
}

export class Step6RuntimeDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature: number;

  @ApiProperty()
  @IsInt()
  @Min(50)
  @Max(8000)
  maxTokens: number;

  @ApiProperty()
  @IsInt()
  @Min(5)
  @Max(120)
  timeoutSeconds: number;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(240)
  fallbackBehavior: string;
}

export class ValidateStepDto {
  @ApiProperty({ enum: [1, 2, 3, 4, 5, 6] })
  @IsInt()
  @IsIn([1, 2, 3, 4, 5, 6])
  step: number;

  @ApiProperty({ type: Object })
  @IsObject()
  data: Record<string, unknown>;
}

export class CreateAgentDto {
  @ApiProperty({ type: Step1BasicsDto })
  @ValidateNested()
  @Type(() => Step1BasicsDto)
  step1: Step1BasicsDto;

  @ApiProperty({ type: Step2PurposeDto })
  @ValidateNested()
  @Type(() => Step2PurposeDto)
  step2: Step2PurposeDto;

  @ApiProperty({ type: Step3PromptDto })
  @ValidateNested()
  @Type(() => Step3PromptDto)
  step3: Step3PromptDto;

  @ApiProperty({ type: Step4ModelDto })
  @ValidateNested()
  @Type(() => Step4ModelDto)
  step4: Step4ModelDto;

  @ApiProperty({ type: Step5MemoryDto })
  @ValidateNested()
  @Type(() => Step5MemoryDto)
  step5: Step5MemoryDto;

  @ApiProperty({ type: Step6RuntimeDto })
  @ValidateNested()
  @Type(() => Step6RuntimeDto)
  step6: Step6RuntimeDto;
}

export type AgentWizardData = CreateAgentDto;
