import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Sale } from "../sales/entities";
import { Purchase } from "../purchases/entities";
import { Expense } from "../expenses/entities";
import { Product } from "../products/entities";
import { KhataTransaction } from "../khata-transactions/entities";
import { Customer } from "../customers/entities";
import { AiConversation } from "./entities";

import { SalesService } from "../sales/sales.service";
import { PurchasesService } from "../purchases/purchases.service";
import { ExpensesService } from "../expenses/expenses.service";

import { ChatMessageDto } from "./dto";

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);
  private readonly azureEndpoint: string;
  private readonly azureApiKey: string;
  private readonly azureDeployment: string;
  private readonly azureApiVersion: string;

  constructor(
    private configService: ConfigService,

    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,

    @InjectRepository(Purchase)
    private purchaseRepo: Repository<Purchase>,

    @InjectRepository(Expense)
    private expenseRepo: Repository<Expense>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(KhataTransaction)
    private khataRepo: Repository<KhataTransaction>,

    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,

    @InjectRepository(AiConversation)
    private conversationRepo: Repository<AiConversation>,

    private salesService: SalesService,
    private purchasesService: PurchasesService,
    private expensesService: ExpensesService,
  ) {
    this.azureEndpoint = this.configService.getOrThrow<string>("AZURE_OPENAI_ENDPOINT");
    this.azureApiKey = this.configService.getOrThrow<string>("AZURE_OPENAI_API_KEY");
    this.azureDeployment = this.configService.getOrThrow<string>("AZURE_OPENAI_DEPLOYMENT");
    this.azureApiVersion = this.configService.get<string>("AZURE_OPENAI_API_VERSION") || "2024-02-15-preview";
  }

  // =====================================
  // CHAT
  // =====================================
  async chat(
    messages: ChatMessageDto[],
    shopId: number,
    userId: number,
    conversationId?: number,
  ) {
    const context = await this.getShopContext(shopId);
    const products = await this.getProductList(shopId);
    const customers = await this.getCustomerList(shopId);

    const systemPrompt = this.buildSystemPrompt(context, products, customers);

    const response = await this.callAzureOpenAI(systemPrompt, messages);

    // Parse the response
    const result = this.parseAiResponse(response);

    // Save conversation
    const savedConversation = await this.saveConversation(
      messages,
      result,
      shopId,
      userId,
      conversationId,
    );

    return {
      ...result,
      conversationId: savedConversation.id,
    };
  }

  // =====================================
  // PARSE AI RESPONSE
  // =====================================
  private parseAiResponse(response: string) {
    // Check if AI wants to perform an action
    const actionMatch = response.match(
      /\[ACTION:(\w+)\]([\s\S]*?)\[\/ACTION\]/,
    );

    if (actionMatch) {
      const actionType = actionMatch[1];
      const validActions = ["CREATE_SALE", "CREATE_PURCHASE", "CREATE_EXPENSE"];

      if (validActions.includes(actionType)) {
        const actionData = actionMatch[2].trim();
        const textBeforeAction = response
          .substring(0, actionMatch.index)
          .trim();

        return {
          message: textBeforeAction,
          pendingAction: {
            type: actionType,
            data: JSON.parse(actionData),
          },
          options: null,
          chart: null,
        };
      }
    }

    // Check if AI is asking the user to choose between options
    const optionsMatch = response.match(
      /\[OPTIONS\]([\s\S]*?)\[\/OPTIONS\]/,
    );

    if (optionsMatch) {
      const optionsData = optionsMatch[1].trim();
      const textBeforeOptions = response
        .substring(0, optionsMatch.index)
        .trim();

      return {
        message: textBeforeOptions,
        pendingAction: null,
        options: JSON.parse(optionsData),
        chart: null,
      };
    }

    // Check if AI wants to show a chart
    const chartMatch = response.match(
      /\[CHART\]([\s\S]*?)\[\/CHART\]/,
    );

    if (chartMatch) {
      const chartData = chartMatch[1].trim();
      const textWithoutChart = response
        .replace(/\[CHART\][\s\S]*?\[\/CHART\]/, "")
        .trim();

      return {
        message: textWithoutChart,
        pendingAction: null,
        options: null,
        chart: JSON.parse(chartData),
      };
    }

    return { message: response, pendingAction: null, options: null, chart: null };
  }

  // =====================================
  // SAVE CONVERSATION
  // =====================================
  private async saveConversation(
    messages: ChatMessageDto[],
    result: { message: string; pendingAction: any; options: any; chart: any },
    shopId: number,
    userId: number,
    conversationId?: number,
  ): Promise<AiConversation> {
    const assistantMsg: any = { role: "assistant", content: result.message };
    if (result.chart) assistantMsg.chart = result.chart;
    if (result.pendingAction) assistantMsg.pendingAction = result.pendingAction;
    if (result.options) assistantMsg.options = result.options;

    if (conversationId) {
      // Update existing conversation
      const conversation = await this.conversationRepo.findOne({
        where: { id: conversationId, shop: { id: shopId }, user: { id: userId } },
      });

      if (conversation) {
        conversation.messages = [
          ...messages,
          assistantMsg,
        ];
        return this.conversationRepo.save(conversation);
      }
    }

    // Create new conversation
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    const title = lastUserMessage
      ? lastUserMessage.content.substring(0, 80)
      : "New conversation";

    const conversation = this.conversationRepo.create({
      shop: { id: shopId } as any,
      user: { id: userId } as any,
      title,
      messages: [
        ...messages,
        assistantMsg,
      ],
    });

    return this.conversationRepo.save(conversation);
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
    if (conversation) {
      await this.conversationRepo.remove(conversation);
    }
    return { deleted: true };
  }

  // =====================================
  // CONFIRM ACTION
  // =====================================
  async confirmAction(
    actionType: string,
    actionData: any,
    shopId: number,
    userId: number,
  ) {
    switch (actionType) {
      case "CREATE_SALE":
        return this.executeSale(actionData, shopId, userId);

      case "CREATE_PURCHASE":
        return this.executePurchase(actionData, shopId, userId);

      case "CREATE_EXPENSE":
        return this.executeExpense(actionData, shopId, userId);

      default:
        throw new InternalServerErrorException(
          `Unknown action type: ${actionType}`,
        );
    }
  }

  // =====================================
  // EXECUTE ACTIONS
  // =====================================
  private async executeSale(data: any, shopId: number, userId: number) {
    return this.salesService.create(data, shopId, userId);
  }

  private async executePurchase(data: any, shopId: number, userId: number) {
    return this.purchasesService.create(data, shopId, userId);
  }

  private async executeExpense(data: any, shopId: number, userId: number) {
    return this.expensesService.create(data, shopId);
  }

  // =====================================
  // SHOP CONTEXT
  // =====================================
  private async getShopContext(shopId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allSales = await this.saleRepo.find({
      where: { shop: { id: shopId } },
      relations: { items: { product: true }, customer: true },
      order: { createdAt: "DESC" },
    });

    const todaySales = allSales.filter((s) => s.createdAt >= today);
    const todaySalesTotal = todaySales.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );

    const allProducts = await this.productRepo.find({
      where: { shop: { id: shopId } },
    });

    const lowStockProducts = allProducts.filter(
      (p) => p.stock <= p.lowStockLimit,
    );

    const khataTransactions = await this.khataRepo.find({
      where: { shop: { id: shopId } },
    });

    const totalCredit = khataTransactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalPayment = khataTransactions
      .filter((t) => t.type === "payment")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalDue = totalCredit - totalPayment;

    const expenses = await this.expenseRepo.find({
      where: { shop: { id: shopId } },
    });
    const todayExpenses = expenses.filter((e) => e.createdAt >= today);
    const todayExpensesTotal = todayExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    const purchases = await this.purchaseRepo.find({
      where: { shop: { id: shopId } },
    });
    const todayPurchases = purchases.filter((p) => p.createdAt >= today);
    const todayPurchasesTotal = todayPurchases.reduce(
      (sum, p) => sum + Number(p.totalAmount),
      0,
    );

    // Aggregate top-selling products from all sales history
    const productSalesMap = new Map<number, { name: string; totalQty: number; totalRevenue: number }>();
    for (const sale of allSales) {
      if (!sale.items) continue;
      for (const item of sale.items) {
        const pid = item.product?.id;
        if (!pid) continue;
        const existing = productSalesMap.get(pid) || { name: item.product.name, totalQty: 0, totalRevenue: 0 };
        existing.totalQty += Number(item.quantity);
        existing.totalRevenue += Number(item.quantity) * Number(item.unitPrice);
        productSalesMap.set(pid, existing);
      }
    }
    const topSellingProducts = Array.from(productSalesMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 10);

    // Recent sales (last 10)
    const recentSales = allSales.slice(0, 10).map((s) => ({
      date: s.createdAt,
      total: Number(s.totalAmount),
      items: s.items?.map((i) => `${i.product?.name} x${i.quantity}`) || [],
      customer: s.customer?.name || "Walk-in",
    }));

    // Daily sales for last 7 days
    const dailySales: { date: string; total: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      const daySales = allSales.filter((s) => s.createdAt >= d && s.createdAt < nextD);
      dailySales.push({
        date: d.toISOString().split("T")[0],
        total: daySales.reduce((sum, s) => sum + Number(s.totalAmount), 0),
        count: daySales.length,
      });
    }

    // Expense breakdown by category
    const expenseByCategoryMap = new Map<string, number>();
    for (const e of expenses) {
      const cat = (e as any).category || "Other";
      expenseByCategoryMap.set(cat, (expenseByCategoryMap.get(cat) || 0) + Number(e.amount));
    }
    const expenseByCategory = Array.from(expenseByCategoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Stock distribution by category
    const stockByCategoryMap = new Map<string, { count: number; totalStock: number; totalValue: number }>();
    for (const p of allProducts) {
      const cat = (p as any).category?.name || "Uncategorized";
      const existing = stockByCategoryMap.get(cat) || { count: 0, totalStock: 0, totalValue: 0 };
      existing.count++;
      existing.totalStock += Number(p.stock);
      existing.totalValue += Number(p.stock) * Number(p.sellingPrice);
      stockByCategoryMap.set(cat, existing);
    }
    const stockByCategory = Array.from(stockByCategoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.totalValue - a.totalValue);

    return {
      todaySalesTotal,
      todaySalesCount: todaySales.length,
      totalSalesAllTime: allSales.length,
      totalRevenueAllTime: allSales.reduce((sum, s) => sum + Number(s.totalAmount), 0),
      todayPurchasesTotal,
      todayExpensesTotal,
      totalProducts: allProducts.length,
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        lowStockLimit: p.lowStockLimit,
      })),
      totalDue,
      topSellingProducts,
      recentSales,
      dailySales,
      expenseByCategory,
      stockByCategory,
    };
  }

  // =====================================
  // PRODUCT LIST
  // =====================================
  private async getProductList(shopId: number) {
    const products = await this.productRepo.find({
      where: { shop: { id: shopId }, isActive: true },
      select: ["id", "name", "barcode", "sellingPrice", "purchasePrice", "stock", "category"],
    });
    return products;
  }

  // =====================================
  // CUSTOMER LIST
  // =====================================
  private async getCustomerList(shopId: number) {
    const customers = await this.customerRepo.find({
      where: { shop: { id: shopId } },
      select: ["id", "name", "phone"],
    });
    return customers;
  }

  // =====================================
  // SYSTEM PROMPT
  // =====================================
  private buildSystemPrompt(
    context: any,
    products: any[],
    customers: any[],
  ): string {
    return `You are the AI assistant for Sajilo Khata, a shop management and POS system. You help shop owners manage their business.

## YOUR CAPABILITIES
1. Answer questions about how the app works (features, navigation, how-to)
2. Answer data queries using the real-time shop data provided below
3. Help record sales, purchases, and expenses from natural language
4. Generate charts/graphs when the user asks for visual data representation

## CURRENT SHOP DATA (Real-time)
- Today's Sales: Rs ${context.todaySalesTotal} (${context.todaySalesCount} transactions)
- Today's Purchases: Rs ${context.todayPurchasesTotal}
- Today's Expenses: Rs ${context.todayExpensesTotal}
- Total Products: ${context.totalProducts}
- Total Customer Dues: Rs ${context.totalDue}
- Total Sales (All Time): ${context.totalSalesAllTime} transactions, Rs ${context.totalRevenueAllTime}
- Low Stock Products: ${context.lowStockProducts.length > 0 ? context.lowStockProducts.map((p: any) => `${p.name} (${p.stock}/${p.lowStockLimit})`).join(", ") : "None"}

## TOP SELLING PRODUCTS (All Time, by quantity sold)
${context.topSellingProducts.length > 0 ? context.topSellingProducts.map((p: any, i: number) => `${i + 1}. ${p.name} — ${p.totalQty} units sold, Rs ${p.totalRevenue} revenue`).join("\n") : "No sales recorded yet"}

## RECENT SALES (Last 10)
${context.recentSales.length > 0 ? context.recentSales.map((s: any) => `- ${new Date(s.date).toLocaleDateString()} | Rs ${s.total} | ${s.customer} | ${s.items.join(", ")}`).join("\n") : "No sales recorded yet"}

## DAILY SALES (Last 7 Days)
${context.dailySales.map((d: any) => `- ${d.date}: Rs ${d.total} (${d.count} sales)`).join("\n")}

## EXPENSE BREAKDOWN (By Category)
${context.expenseByCategory.length > 0 ? context.expenseByCategory.map((e: any) => `- ${e.category}: Rs ${e.amount}`).join("\n") : "No expenses recorded"}

## STOCK BY CATEGORY
${context.stockByCategory.length > 0 ? context.stockByCategory.map((s: any) => `- ${s.category}: ${s.count} products, ${s.totalStock} units, Rs ${s.totalValue} value`).join("\n") : "No products"}

## PRODUCT CATALOG
${products.map((p) => `- ID:${p.id} | ${p.name} | SKU:${p.sku} | Price:Rs${p.sellingPrice} | Cost:Rs${p.purchasePrice} | Stock:${p.stock} | Category:${p.category}`).join("\n")}

## CUSTOMER LIST
${customers.length > 0 ? customers.map((c) => `- ID:${c.id} | ${c.name} | Phone:${c.phone}`).join("\n") : "No customers yet"}

## APP FEATURES (for answering how-to questions)
- Dashboard: Overview of sales, purchases, expenses, profit, low stock alerts
- Inventory: Add/edit/delete products, search, filter by category/stock, pagination
- Billing: POS system - select products, create cart, choose payment method, generate invoice
- Customers: Add/manage customers, view purchase history
- Khata: Credit ledger - track customer dues, record payments
- Suppliers: Manage suppliers, track purchases, record payments
- Categories: Organize products into categories
- Analytics: Charts for sales trends, top products, expense breakdown
- Settings: Update profile, shop info, change password

## CREATING TRANSACTIONS
When the user asks to record a sale, purchase, or expense in natural language:
1. Match product names to the product catalog above (use fuzzy matching - "rice" matches "Basmati Rice", etc.)
2. Show a clear summary of what will be saved
3. Include the action block so the system can execute it after user confirmation

For SALES, output this format:
[ACTION:CREATE_SALE]
{
  "items": [{"productId": <id>, "quantity": <qty>, "unitPrice": <price>}],
  "paymentMethod": "cash",
  "paidAmount": <total>,
  "note": "<description>"
}
[/ACTION]

For PURCHASES, output this format:
[ACTION:CREATE_PURCHASE]
{
  "items": [{"productId": <id>, "quantity": <qty>, "unitPrice": <cost_price>}],
  "paymentMethod": "cash",
  "paidAmount": <total>,
  "note": "<description>"
}
[/ACTION]

For EXPENSES, output this format:
[ACTION:CREATE_EXPENSE]
{
  "title": "<title>",
  "amount": <amount>,
  "category": "<category>",
  "note": "<note>"
}
[/ACTION]

## IMPORTANT RULES
- Always use product IDs from the catalog. If a product is not found, tell the user.
- Use sellingPrice for sales, purchasePrice for purchases.
- Default payment method is "cash" unless user specifies otherwise.
- Keep responses concise and helpful.
- Format currency as "Rs X" (Nepali Rupees).
- When showing summaries, use clear tables or lists.
- Never fabricate data. Only use the real-time data provided above.
- For follow-up questions, always reference the conversation history above. If the user says "among them", "which one", "from those", etc., refer to the items mentioned in your previous response.
- When computing profit, use (sellingPrice - purchasePrice) from the product catalog.
- **CRITICAL: When a product name is ambiguous and matches multiple items in the catalog, you MUST ask the user to clarify which specific product they mean BEFORE creating an action block.** For example, if the user says "rice" and there are "Basmati Rice", "Sona Masuri Rice", and "Jira Rice" in the catalog, list all matching products with their prices and ask the user to pick one. Do NOT assume which one they want. Only create the [ACTION] block after the user has specified the exact product.
- When asking the user to choose between multiple options, ALWAYS include an [OPTIONS] block with the choices so the UI can render clickable buttons.

## CLARIFICATION OPTIONS FORMAT
When you need the user to choose between options (e.g., which product), output this block:
[OPTIONS]
["Basmati Rice (1kg) — Rs 110", "Sona Masuri Rice (1kg) — Rs 85", "Jira Rice (1kg) — Rs 71"]
[/OPTIONS]
The array should contain short, clear labels for each option. Always include this block when asking the user to choose.

## CHART/GRAPH OUTPUT
When the user asks for a chart, graph, trend, visualization, breakdown, or comparison — output a [CHART] block with JSON data.
Supported chart types: "bar", "line", "pie"

Format:
[CHART]
{
  "type": "bar",
  "title": "Top Selling Products",
  "xKey": "name",
  "yKey": "value",
  "yLabel": "Units Sold",
  "data": [
    {"name": "Product A", "value": 100},
    {"name": "Product B", "value": 80}
  ]
}
[/CHART]

For pie charts, use "nameKey" and "valueKey" instead of "xKey"/"yKey":
[CHART]
{
  "type": "pie",
  "title": "Expense Breakdown",
  "nameKey": "name",
  "valueKey": "value",
  "data": [
    {"name": "Rent", "value": 5000},
    {"name": "Electricity", "value": 2000}
  ]
}
[/CHART]

Rules for charts:
- Use the real data from the shop context above — never fabricate chart data
- Always include a descriptive "title"
- Keep data arrays concise (max 15 items)
- Always add a brief text explanation alongside the chart
- If the user says "show", "visualize", "chart", "graph", "trend", "breakdown", or "compare" — prefer a [CHART] block over a plain table
- **CRITICAL: NEVER use [ACTION] for charts. Charts use [CHART]...[/CHART] only. The [ACTION] block is ONLY for CREATE_SALE, CREATE_PURCHASE, and CREATE_EXPENSE. Do NOT invent new action types like GENERATE_BAR_CHART.**`;
  }

  // =====================================
  // CALL AZURE OPENAI API
  // =====================================
  private async callAzureOpenAI(
    systemPrompt: string,
    messages: ChatMessageDto[],
  ): Promise<string> {
    const url = `${this.azureEndpoint}openai/deployments/${this.azureDeployment}/chat/completions?api-version=${this.azureApiVersion}`;

    const body = {
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      max_tokens: 2048,
      temperature: 0.3,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.azureApiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Azure OpenAI error: ${response.status} ${errorText}`);
      throw new InternalServerErrorException("AI service unavailable");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
