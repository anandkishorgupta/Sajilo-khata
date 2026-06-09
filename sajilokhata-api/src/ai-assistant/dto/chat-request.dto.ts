import { IsArray, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class ChatMessageDto {
  @IsString()
  role: string;

  @IsString()
  content: string;
}

export class ChatRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}
