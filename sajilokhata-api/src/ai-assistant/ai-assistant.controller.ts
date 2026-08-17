import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import type{ Response } from "express";

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

  @Post("chat-stream")
  async chatStream(
    @Body() dto: ChatRequestDto,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    try {
      const result = this.aiAssistantService.chatStream(
        dto.messages,
        user.shopId,
        user.userId,
      );

      let fullText = "";
      for await (const chunk of result.textStream) {
        fullText += chunk;
        res.write(`data: ${JSON.stringify({ type: "text", text: chunk })}\n\n`);
      }

      const { conversationId, chart } =
        await this.aiAssistantService.finalizeChat(
          dto.messages,
          fullText,
          user.shopId,
          user.userId,
          dto.conversationId,
        );

      res.write(
        `data: ${JSON.stringify({ type: "done", conversationId, chart })}\n\n`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Stream failed";
      res.write(
        `data: ${JSON.stringify({ type: "error", message })}\n\n`,
      );
    } finally {
      res.end();
    }
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