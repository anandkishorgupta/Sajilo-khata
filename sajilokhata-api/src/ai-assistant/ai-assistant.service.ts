import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateText, stepCountIs, streamText, tool } from 'ai';
import { z } from 'zod';

import { ChatMessageDto } from './dto';
import { AiConversation } from './entities';
import { AiSdkService } from './llm/ai-sdk.service';
import { SYSTEM_PROMPT } from './prompts/system.prompt';
import { ExpenseTool } from './tools/expense.tool';
import { InventoryTool } from './tools/inventory.tool';
import { KhataTool } from './tools/khata.tool';
import { PurchaseTool } from './tools/purchase.tool';
import { SalesTool } from './tools/sales.tool';

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    private aiSdkService: AiSdkService,
    private salesTool: SalesTool,
    private expenseTool: ExpenseTool,
    private inventoryTool: InventoryTool,
    private khataTool: KhataTool,
    private purchaseTool: PurchaseTool,

    @InjectRepository(AiConversation)
    private conversationRepo: Repository<AiConversation>,
  ) {}

  // =====================================
  // CHAT — agentic tool-calling loop
  // (Vercel AI SDK handles the loop via stopWhen)
  // =====================================
  async chat(
    messages: ChatMessageDto[],
    shopId: number,
    userId: number,
    conversationId?: number,
  ) {
    const result = await generateText({
      model: this.aiSdkService.getModel(),
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      tools: this.toolDefinitions(shopId, userId),
      stopWhen: stepCountIs(10),
      temperature: 0.3,
    });

    const parsed = this.parseChartFromText(result.text);

    const saved = await this.saveConversation(
      messages,
      parsed,
      shopId,
      userId,
      conversationId,
    );

    return { ...parsed, conversationId: saved.id };
  }

  // =====================================
  // CHAT — streaming variant
  // Returns a StreamTextResult with .textStream
  // =====================================
  chatStream(
    messages: ChatMessageDto[],
    shopId: number,
    userId: number,
  ) {
    return streamText({
      model: this.aiSdkService.getModel(),
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      tools: this.toolDefinitions(shopId, userId),
      stopWhen: stepCountIs(10),
      temperature: 0.3,
    });
  }

  // =====================================
  // FINALIZE — parse chart + save after stream ends
  // =====================================
  async finalizeChat(
    messages: ChatMessageDto[],
    fullText: string,
    shopId: number,
    userId: number,
    conversationId?: number,
  ) {
    const parsed = this.parseChartFromText(fullText);
    const saved = await this.saveConversation(
      messages,
      parsed,
      shopId,
      userId,
      conversationId,
    );
    return { ...parsed, conversationId: saved.id };
  }

  // =====================================
  // TOOL DEFINITIONS
  // =====================================
  private toolDefinitions(shopId: number, userId: number) {
    return {
      // ── Sales ──
      getTodaySales: tool({
        description:
          "Get today's total sales amount and transaction count. Use for: aaja ko bikri, today's sales, today's revenue.",
        inputSchema: z.object({}),
        execute: () => this.salesTool.getTodaySales(shopId),
      }),
      getWeeklySales: tool({
        description:
          'Get daily sales breakdown for the last N days. Use for: weekly report, sales trend, last 7 days, hapta ko bikri.',
        inputSchema: z.object({
          days: z
            .number()
            .describe('Number of past days. Default 7.')
            .optional(),
        }),
        execute: ({ days }: { days?: number }) =>
          this.salesTool.getWeeklySales(shopId, days ?? 7),
      }),
      getTopSelling: tool({
        description:
          'Get top selling products by quantity sold. Use for: best sellers, popular products, top products, sabai bhandaa bढi bikne.',
        inputSchema: z.object({
          limit: z
            .number()
            .describe('How many products to return. Default 10.')
            .optional(),
        }),
        execute: ({ limit }: { limit?: number }) =>
          this.salesTool.getTopSelling(shopId, limit ?? 10),
      }),
      getRecentSales: tool({
        description:
          'Get list of most recent sales with items and customer info.',
        inputSchema: z.object({
          limit: z
            .number()
            .describe('How many recent sales. Default 10.')
            .optional(),
        }),
        execute: ({ limit }: { limit?: number }) =>
          this.salesTool.getRecentSales(shopId, limit ?? 10),
      }),
      createSale: tool({
        description:
          'Record a new sale transaction. Call getProductCatalog first to get product IDs.',
        inputSchema: z.object({
          items: z.array(
            z.object({
              productId: z.number(),
              quantity: z.number(),
              unitPrice: z.number(),
            }),
          ),
          paymentMethod: z
            .enum(['cash', 'card', 'online'])
            .describe('Default: cash')
            .optional(),
          paidAmount: z.number(),
          customerId: z.number().describe('Optional customer ID').optional(),
          note: z.string().optional(),
        }),
        execute: (args) => this.salesTool.createSale(args, shopId, userId),
      }),

      // ── Expenses ──
      getTodayExpense: tool({
        description:
          "Get today's total expenses. Use for: aaja ko kharcha, today's spending.",
        inputSchema: z.object({}),
        execute: () => this.expenseTool.getTodayExpense(shopId),
      }),
      getExpenseBreakdown: tool({
        description:
          'Get expenses grouped by category. Use for: expense breakdown, kharcha ko vivaran, spending analysis.',
        inputSchema: z.object({
          days: z
            .number()
            .describe('Past N days. Omit for all time.')
            .optional(),
        }),
        execute: ({ days }: { days?: number }) =>
          this.expenseTool.getExpenseBreakdown(shopId, days),
      }),
      getMonthlyExpense: tool({
        description: "Get this month's total expenses.",
        inputSchema: z.object({}),
        execute: () => this.expenseTool.getMonthlyExpense(shopId),
      }),
      createExpense: tool({
        description: 'Record a new expense.',
        inputSchema: z.object({
          title: z.string(),
          amount: z.number(),
          category: z.string().optional(),
          note: z.string().optional(),
        }),
        execute: (args) => this.expenseTool.createExpense(args, shopId),
      }),

      // ── Inventory ──
      getLowStock: tool({
        description:
          'Get products that are low on stock or below their minimum limit. Use for: low stock alert, stock out, khatiyeko maal.',
        inputSchema: z.object({}),
        execute: () => this.inventoryTool.getLowStock(shopId),
      }),
      getProductCatalog: tool({
        description:
          'Get full product list with IDs, names, prices, and stock. REQUIRED before creating any sale or purchase.',
        inputSchema: z.object({}),
        execute: () => this.inventoryTool.getProductCatalog(shopId),
      }),
      getInventoryValue: tool({
        description:
          'Get total inventory value at cost and selling price. Use for: stock value, inventory worth.',
        inputSchema: z.object({}),
        execute: () => this.inventoryTool.getInventoryValue(shopId),
      }),
      getCustomerList: tool({
        description:
          'Get list of all customers with phone numbers. Use before creating a sale for a specific customer.',
        inputSchema: z.object({}),
        execute: () => this.inventoryTool.getCustomerList(shopId),
      }),

      // ── Khata ──
      getTotalDue: tool({
        description:
          'Get total outstanding customer dues. Use for: total due, total credit, khata, udhaaro.',
        inputSchema: z.object({}),
        execute: () => this.khataTool.getTotalDue(shopId),
      }),
      getCustomerDues: tool({
        description:
          'Get dues broken down per customer. Use for: who owes money, customer wise due, pratyek customer ko udhaaro.',
        inputSchema: z.object({}),
        execute: () => this.khataTool.getCustomerDues(shopId),
      }),

      // ── Purchases ──
      getTodayPurchase: tool({
        description:
          "Get today's total purchases. Use for: aaja ko kharid, today's purchase.",
        inputSchema: z.object({}),
        execute: () => this.purchaseTool.getTodayPurchase(shopId),
      }),
      getPurchaseSummary: tool({
        description: 'Get purchase total for last N days.',
        inputSchema: z.object({
          days: z.number().describe('Past N days. Default 30.').optional(),
        }),
        execute: ({ days }: { days?: number }) =>
          this.purchaseTool.getPurchaseSummary(shopId, days ?? 30),
      }),
      createPurchase: tool({
        description:
          'Record a new purchase/stock-in. Call getProductCatalog first.',
        inputSchema: z.object({
          items: z.array(
            z.object({
              productId: z.number(),
              quantity: z.number(),
              unitPrice: z.number(),
            }),
          ),
          paymentMethod: z.enum(['cash', 'card', 'online']).optional(),
          paidAmount: z.number(),
          note: z.string().optional(),
        }),
        execute: (args) =>
          this.purchaseTool.createPurchase(args, shopId, userId),
      }),
    };
  }

  // =====================================
  // PARSE CHART FROM TEXT
  // =====================================
  private parseChartFromText(text: string): {
    message: string;
    chart: any | null;
  } {
    // Try fenced ```chart block first
    let match = text.match(/```chart\s*([\s\S]*?)```/);
    let raw = match?.[1];
    let fullMatch = match?.[0];

    // Fallback: <chart>...</chart> tags
    if (!raw) {
      match = text.match(/<chart>\s*([\s\S]*?)\s*<\/chart>/);
      raw = match?.[1];
      fullMatch = match?.[0];
    }

    if (raw && fullMatch) {
      try {
        const chart = JSON.parse(raw.trim());
        const message = text.replace(fullMatch, '').trim();
        return { message, chart };
      } catch {
        this.logger.warn(`Malformed chart JSON: ${raw}`);
      }
    }

    return { message: text, chart: null };
  }

  // =====================================
  // CONVERSATION CRUD
  // =====================================
  async getConversations(shopId: number, userId: number) {
    return this.conversationRepo.find({
      where: { shop: { id: shopId }, user: { id: userId } },
      select: ['id', 'title', 'createdAt', 'updatedAt'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getConversation(id: number, shopId: number, userId: number) {
    return this.conversationRepo.findOne({
      where: { id, shop: { id: shopId }, user: { id: userId } },
    });
  }

  async deleteConversation(id: number, shopId: number, userId: number) {
    const conversation = await this.conversationRepo.findOne({
      where: { id, shop: { id: shopId }, user: { id: userId } },
    });
    if (conversation) await this.conversationRepo.remove(conversation);
    return { deleted: true };
  }

  // =====================================
  // SAVE CONVERSATION
  // =====================================
  private async saveConversation(
    messages: ChatMessageDto[],
    result: { message: string; chart: any | null },
    shopId: number,
    userId: number,
    conversationId?: number,
  ): Promise<AiConversation> {
    const assistantMsg: any = { role: 'assistant', content: result.message };
    if (result.chart) assistantMsg.chart = result.chart;

    if (conversationId) {
      const existing = await this.conversationRepo.findOne({
        where: {
          id: conversationId,
          shop: { id: shopId },
          user: { id: userId },
        },
      });
      if (existing) {
        existing.messages = [...messages, assistantMsg];
        return this.conversationRepo.save(existing);
      }
    }

    const lastUser = messages.filter((m) => m.role === 'user').pop();
    const title = lastUser
      ? lastUser.content.substring(0, 80)
      : 'New conversation';

    const conversation = this.conversationRepo.create({
      shop: { id: shopId },
      user: { id: userId },
      title,
      messages: [...messages, assistantMsg],
    });

    return this.conversationRepo.save(conversation);
  }
}
