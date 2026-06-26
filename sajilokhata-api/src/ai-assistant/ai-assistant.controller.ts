import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AiAssistantService } from "./ai-assistant.service";
import { ChatRequestDto } from "./dto";

@Controller("ai-assistant")
@UseGuards(JwtAuthGuard)
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) { }

  @Post("chat")
  chat(@Body() dto: ChatRequestDto, @CurrentUser() user: any) {
    console.log("user", user)
    return this.aiAssistantService.chat(
      dto.messages,
      user.shopId,
      user.userId,
      dto.conversationId,
    );
  }

  @Get("conversations")
  getConversations(@CurrentUser() user: any) {
    return this.aiAssistantService.getConversations(user.shopId, user.userId);
  }

  @Get("conversations/:id")
  getConversation(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.aiAssistantService.getConversation(id, user.shopId, user.userId);
  }

  @Delete("conversations/:id")
  deleteConversation(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.aiAssistantService.deleteConversation(id, user.shopId, user.userId);
  }
}