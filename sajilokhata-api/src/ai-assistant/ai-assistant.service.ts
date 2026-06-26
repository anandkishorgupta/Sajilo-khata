import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ChatMessageDto } from "./dto";
import { AiConversation } from "./entities";
import { AzureOpenAiService } from "./llm/azure.service";
import { SYSTEM_PROMPT } from "./prompts/system.prompt";
import { ExpenseTool } from "./tools/expense.tool";
import { InventoryTool } from "./tools/inventory.tool";
import { KhataTool } from "./tools/khata.tool";
import { PurchaseTool } from "./tools/purchase.tool";
import { SalesTool } from "./tools/sales.tool";

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    private azureService: AzureOpenAiService,
    private salesTool: SalesTool,
    private expenseTool: ExpenseTool,
    private inventoryTool: InventoryTool,
    private khataTool: KhataTool,
    private purchaseTool: PurchaseTool,

    @InjectRepository(AiConversation)
    private conversationRepo: Repository<AiConversation>,
  ) { }

  // =====================================
  // CHAT — agentic tool-calling loop
  // =====================================
  async chat(
    messages: ChatMessageDto[],
    shopId: number,
    userId: number,
    conversationId?: number,
  ) {
    const apiMessages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    let response = await this.azureService.call(apiMessages, this.toolDefinitions());

    // Agentic loop — keep going until Azure stops calling tools
    while (response.finish_reason === "tool_calls") {
      const toolCalls: any[] = response.message.tool_calls ?? [];

      // Append assistant message with tool_calls to history
      apiMessages.push(response.message);

      // Execute all tool calls in parallel
      const toolResults = await Promise.all(
        toolCalls.map(async (tc) => {
          const args = JSON.parse(tc.function.arguments || "{}");
          this.logger.log(`Tool called: ${tc.function.name} args: ${JSON.stringify(args)}`);
          const result = await this.executeTool(tc.function.name, args, shopId, userId);
          return {
            role: "tool" as const,
            tool_call_id: tc.id,
            content: JSON.stringify(result),
          };
        }),
      );
      // const toolResults = await Promise.all(
      //   toolCalls.map(async (tc) => {
      //     let args: any = {};
      //     try {
      //       const parsed = JSON.parse(tc.function.arguments || "{}");
      //       args = parsed && typeof parsed === "object" ? parsed : {};
      //     } catch {
      //       this.logger.warn(`Failed to parse args for ${tc.function.name}: ${tc.function.arguments}`);
      //       args = {};
      //     }
      //     this.logger.log(`Tool called: ${tc.function.name} args: ${JSON.stringify(args)}`);
      //     const result = await this.executeTool(tc.function.name, args, shopId, userId);
      //     return {
      //       role: "tool" as const,
      //       tool_call_id: tc.id,
      //       content: JSON.stringify(result),
      //     };
      //   }),
      // );
      apiMessages.push(...toolResults);
      response = await this.azureService.call(apiMessages, this.toolDefinitions());
    }

    const finalMessage = response.message.content ?? "";
    const parsed = this.parseChartFromText(finalMessage);

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
  // TOOL ROUTER
  // =====================================
  private async executeTool(
    name: string,
    args: any,
    shopId: number,
    userId: number,
  ): Promise<any> {
    switch (name) {
      // Sales
      case "getTodaySales": return this.salesTool.getTodaySales(shopId);
      case "getWeeklySales": return this.salesTool.getWeeklySales(shopId, args.days);
      case "getTopSelling": return this.salesTool.getTopSelling(shopId, args.limit);
      case "getRecentSales": return this.salesTool.getRecentSales(shopId, args.limit);
      case "createSale": return this.salesTool.createSale(args, shopId, userId);

      // Expenses
      case "getTodayExpense": return this.expenseTool.getTodayExpense(shopId);
      case "getExpenseBreakdown": return this.expenseTool.getExpenseBreakdown(shopId, args.days);
      case "getMonthlyExpense": return this.expenseTool.getMonthlyExpense(shopId);
      case "createExpense": return this.expenseTool.createExpense(args, shopId);

      // Inventory
      case "getLowStock": return this.inventoryTool.getLowStock(shopId);
      case "getProductCatalog": return this.inventoryTool.getProductCatalog(shopId);
      case "getInventoryValue": return this.inventoryTool.getInventoryValue(shopId);
      case "getCustomerList": return this.inventoryTool.getCustomerList(shopId);

      // Khata
      case "getTotalDue": return this.khataTool.getTotalDue(shopId);
      case "getCustomerDues": return this.khataTool.getCustomerDues(shopId);

      // Purchases
      case "getTodayPurchase": return this.purchaseTool.getTodayPurchase(shopId);
      case "getPurchaseSummary": return this.purchaseTool.getPurchaseSummary(shopId, args.days);
      case "createPurchase": return this.purchaseTool.createPurchase(args, shopId, userId);

      default:
        this.logger.warn(`Unknown tool: ${name}`);
        return { error: `Unknown tool: ${name}` };
    }
  }

  // =====================================
  // TOOL DEFINITIONS (sent to Azure)
  // =====================================
  private toolDefinitions() {
    return [
      // ── Sales ──
      {
        type: "function",
        function: {
          name: "getTodaySales",
          description: "Get today's total sales amount and transaction count. Use for: aaja ko bikri, today's sales, today's revenue.",
          parameters: { type: "object", properties: {}, required: [] },
        },
      },
      {
        type: "function",
        function: {
          name: "getWeeklySales",
          description: "Get daily sales breakdown for the last N days. Use for: weekly report, sales trend, last 7 days, hapta ko bikri.",
          parameters: {
            type: "object",
            properties: {
              days: { type: "number", description: "Number of past days. Default 7." },
            },
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getTopSelling",
          description: "Get top selling products by quantity sold. Use for: best sellers, popular products, top products, sabai bhandaa bढi bikne.",
          parameters: {
            type: "object",
            properties: {
              limit: { type: "number", description: "How many products to return. Default 10." },
            },
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getRecentSales",
          description: "Get list of most recent sales with items and customer info.",
          parameters: {
            type: "object",
            properties: {
              limit: { type: "number", description: "How many recent sales. Default 10." },
            },
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "createSale",
          description: "Record a new sale transaction. Call getProductCatalog first to get product IDs.",
          parameters: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    productId: { type: "number" },
                    quantity: { type: "number" },
                    unitPrice: { type: "number" },
                  },
                  required: ["productId", "quantity", "unitPrice"],
                },
              },
              paymentMethod: { type: "string", enum: ["cash", "card", "online"], description: "Default: cash" },
              paidAmount: { type: "number" },
              customerId: { type: "number", description: "Optional customer ID" },
              note: { type: "string" },
            },
            required: ["items", "paidAmount"],
          },
        },
      },

      // ── Expenses ──
      {
        type: "function",
        function: {
          name: "getTodayExpense",
          description: "Get today's total expenses. Use for: aaja ko kharcha, today's spending.",
          parameters: { type: "object", properties: {}, required: [] },
        },
      },
      {
        type: "function",
        function: {
          name: "getExpenseBreakdown",
          description: "Get expenses grouped by category. Use for: expense breakdown, kharcha ko vivaran, spending analysis.",
          parameters: {
            type: "object",
            properties: {
              days: { type: "number", description: "Past N days. Omit for all time." },
            },
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getMonthlyExpense",
          description: "Get this month's total expenses.",
          parameters: { type: "object", properties: {}, required: [] },
        },
      },
      {
        type: "function",
        function: {
          name: "createExpense",
          description: "Record a new expense.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              amount: { type: "number" },
              category: { type: "string" },
              note: { type: "string" },
            },
            required: ["title", "amount"],
          },
        },
      },

      // ── Inventory ──
      {
        type: "function",
        function: {
          name: "getLowStock",
          description: "Get products that are low on stock or below their minimum limit. Use for: low stock alert, stock out, khatiyeko maal.",
          parameters: { type: "object", properties: {}, required: [] },
        },
      },
      {
        type: "function",
        function: {
          name: "getProductCatalog",
          description: "Get full product list with IDs, names, prices, and stock. REQUIRED before creating any sale or purchase.",
          parameters: { type: "object", properties: {}, required: [] },
        },
      },
      {
        type: "function",
        function: {
          name: "getInventoryValue",
          description: "Get total inventory value at cost and selling price. Use for: stock value, inventory worth.",
          parameters: { type: "object", properties: {}, required: [] },
        },
      },
      {
        type: "function",
        function: {
          name: "getCustomerList",
          description: "Get list of all customers with phone numbers. Use before creating a sale for a specific customer.",
          parameters: { type: "object", properties: {}, required: [] },
        },
      },

      // ── Khata ──
      {
        type: "function",
        function: {
          name: "getTotalDue",
          description: "Get total outstanding customer dues. Use for: total due, total credit, khata, udhaaro.",
          parameters: { type: "object", properties: {}, required: [] },
        },
      },
      {
        type: "function",
        function: {
          name: "getCustomerDues",
          description: "Get dues broken down per customer. Use for: who owes money, customer wise due, pratyek customer ko udhaaro.",
          parameters: { type: "object", properties: {}, required: [] },
        },
      },

      // ── Purchases ──
      {
        type: "function",
        function: {
          name: "getTodayPurchase",
          description: "Get today's total purchases. Use for: aaja ko kharid, today's purchase.",
          parameters: { type: "object", properties: {}, required: [] },
        },
      },
      {
        type: "function",
        function: {
          name: "getPurchaseSummary",
          description: "Get purchase total for last N days.",
          parameters: {
            type: "object",
            properties: {
              days: { type: "number", description: "Past N days. Default 30." },
            },
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "createPurchase",
          description: "Record a new purchase/stock-in. Call getProductCatalog first.",
          parameters: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    productId: { type: "number" },
                    quantity: { type: "number" },
                    unitPrice: { type: "number" },
                  },
                  required: ["productId", "quantity", "unitPrice"],
                },
              },
              paymentMethod: { type: "string", enum: ["cash", "card", "online"] },
              paidAmount: { type: "number" },
              note: { type: "string" },
            },
            required: ["items", "paidAmount"],
          },
        },
      },
    ];
  }

  // =====================================
  // PARSE CHART FROM TEXT
  // Only thing left to parse — no more [ACTION] regex
  // =====================================
  private parseChartFromText(text: string): { message: string; chart: any | null } {
    const chartMatch = text.match(/```chart\s*([\s\S]*?)```/);
    if (chartMatch) {
      try {
        const chart = JSON.parse(chartMatch[1].trim());
        const message = text.replace(/```chart[\s\S]*?```/, "").trim();
        return { message, chart };
      } catch {
        // malformed chart JSON — just return text
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
      select: ["id", "title", "createdAt", "updatedAt"],
      order: { updatedAt: "DESC" },
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
    const assistantMsg: any = { role: "assistant", content: result.message };
    if (result.chart) assistantMsg.chart = result.chart;

    if (conversationId) {
      const existing = await this.conversationRepo.findOne({
        where: { id: conversationId, shop: { id: shopId }, user: { id: userId } },
      });
      if (existing) {
        existing.messages = [...messages, assistantMsg];
        return this.conversationRepo.save(existing);
      }
    }

    const lastUser = messages.filter((m) => m.role === "user").pop();
    const title = lastUser ? lastUser.content.substring(0, 80) : "New conversation";

    const conversation = this.conversationRepo.create({
      shop: { id: shopId } as any,
      user: { id: userId } as any,
      title,
      messages: [...messages, assistantMsg],
    });

    return this.conversationRepo.save(conversation);
  }
}