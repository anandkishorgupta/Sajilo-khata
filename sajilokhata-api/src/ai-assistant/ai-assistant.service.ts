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
  ) {
    const context = await this.getShopContext(shopId);
    const products = await this.getProductList(shopId);
    const customers = await this.getCustomerList(shopId);

    const systemPrompt = this.buildSystemPrompt(context, products, customers);

    const response = await this.callAzureOpenAI(systemPrompt, messages);

    // Check if AI wants to perform an action
    const actionMatch = response.match(
      /\[ACTION:(\w+)\]([\s\S]*?)\[\/ACTION\]/,
    );

    if (actionMatch) {
      const actionType = actionMatch[1];
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
      };
    }

    return { message: response, pendingAction: null };
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

    return {
      todaySalesTotal,
      todaySalesCount: todaySales.length,
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

## CURRENT SHOP DATA (Real-time)
- Today's Sales: Rs ${context.todaySalesTotal} (${context.todaySalesCount} transactions)
- Today's Purchases: Rs ${context.todayPurchasesTotal}
- Today's Expenses: Rs ${context.todayExpensesTotal}
- Total Products: ${context.totalProducts}
- Total Customer Dues: Rs ${context.totalDue}
- Low Stock Products: ${context.lowStockProducts.length > 0 ? context.lowStockProducts.map((p: any) => `${p.name} (${p.stock}/${p.lowStockLimit})`).join(", ") : "None"}

## PRODUCT CATALOG
${products.map((p) => `- ID:${p.id} | ${p.name} | Barcode:${p.barcode} | Price:Rs${p.sellingPrice} | Cost:Rs${p.purchasePrice} | Stock:${p.stock} | Category:${p.category}`).join("\n")}

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
- If the user's request is ambiguous, ask for clarification.
- Never fabricate data. Only use the real-time data provided above.`;
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
      max_tokens: 1024,
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
