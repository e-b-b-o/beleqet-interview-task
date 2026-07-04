import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RequestProfileBoostDto {
  @ApiPropertyOptional({
    description: 'A specific job title the user is targeting (helps the AI provide tailored feedback)',
    example: 'Senior React Developer',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  targetJobTitle?: string;

  @ApiPropertyOptional({
    description: 'Specific area the user wants the AI to focus on',
    example: 'Leadership skills and architecture experience',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  focusArea?: string;
}
