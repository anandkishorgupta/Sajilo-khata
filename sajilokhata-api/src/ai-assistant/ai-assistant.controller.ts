import {
  Body,
  Controller,
  Post,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

import { AiAssistantService } from "./ai-assistant.service";
import { ChatRequestDto, ConfirmActionDto } from "./dto";

@Controller("ai-assistant")
@UseGuards(JwtAuthGuard)
export class AiAssistantController {
  constructor(
    private readonly aiAssistantService: AiAssistantService,
  ) {}

  // =====================================
  // CHAT
  // =====================================
  @Post("chat")
  chat(
    @Body() dto: ChatRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.aiAssistantService.chat(
      dto.messages,
      user.shopId,
      user.id,
    );
  }

  // =====================================
  // CONFIRM ACTION
  // =====================================
  @Post("confirm")
  confirm(
    @Body() dto: ConfirmActionDto,
    @CurrentUser() user: any,
  ) {
    return this.aiAssistantService.confirmAction(
      dto.actionType,
      dto.actionData,
      user.shopId,
      user.id,
    );
  }
}
