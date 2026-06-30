import * as dotenv from 'dotenv';
dotenv.config();

import * as bcrypt from 'bcrypt';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { Category } from './src/categories/entities/category.entity';
import { Customer } from './src/customers/entities/customer.entity';
import { Expense } from './src/expenses/entities/expense.entity';
import { KhataTransaction } from './src/khata-transactions/entities/khata-transaction.entity';
import { Product } from './src/products/entities/product.entity';
import { Purchase, PurchaseItem } from './src/purchases/entities';
import { SaleItem } from './src/sales/entities/sale-items.entity';
import { Sale } from './src/sales/entities/sales.entity';
import { Shop } from './src/shops/entities/shop.entity';
import { StockMovement } from './src/stock-movements/entities/stock-movement.entity';
import { User } from './src/users/entities/user.entity';

const AppDataSource = new DataSource({
    type: 'postgres',
    url: "postgresql://postgres:bw0E1SOfJgF7VauE@db.odgujlwefhczocqsywxl.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false },
    entities: [
        User, Shop, Category, Product,
        Customer, Sale, SaleItem,
        KhataTransaction, Expense, StockMovement, Purchase, PurchaseItem
    ],
    synchronize: true,
    extra: {
        max: 3,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        keepAlive: true,
    },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function daysAgo(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(rand(8, 20), rand(0, 59), 0, 0);
    return d;
}

function dateStr(d: Date): string {
    return d.toISOString().split('T')[0];
}

let invoiceCounter = 1;
function nextInvoice(): string {
    return `INV-${String(invoiceCounter++).padStart(4, '0')}`;
}

// ─── Static Demo Data (unchanged) ────────────────────────────────────────────

const DEMO_USER = {
    name: 'Ram Bahadur Shrestha',
    email: 'demo@sajilokhata.com',
    password: 'demo1234',
};

const DEMO_SHOP = {
    name: 'Shrestha Kirana Pasal',
    address: 'Newroad, Pokhara-8, Gandaki',
    phone: '9856012345',
};

const CATEGORIES = [
    { name: 'Grain & Pulses', description: 'Chamal, dal, aata, maida' },
    { name: 'Oil & Ghee', description: 'Tori tel, sunflower oil, ghiu' },
    { name: 'Spices', description: 'Masala, jeera, dhania, besar' },
    { name: 'Dairy & Eggs', description: 'Dudh, dahi, cheese, anda' },
    { name: 'Beverages', description: 'Chiya, coffee, juice, cold drinks' },
    { name: 'Snacks', description: 'Biscuit, chips, wai wai, noodles' },
    { name: 'Soap & Hygiene', description: 'Sabun, shampoo, toothpaste' },
    { name: 'Stationery', description: 'Kopi, kalam, eraser' },
];

const PRODUCTS_BY_CATEGORY: Record<string, Array<{
    name: string; purchasePrice: number; sellingPrice: number; stock: number; lowStockLimit: number;
}>> = {
    'Grain & Pulses': [
        { name: 'Basmati Chamal (5kg)', purchasePrice: 480, sellingPrice: 550, stock: 40, lowStockLimit: 10 },
        { name: 'Medium Grain Chamal (5kg)', purchasePrice: 360, sellingPrice: 420, stock: 60, lowStockLimit: 15 },
        { name: 'Masoor Dal (1kg)', purchasePrice: 145, sellingPrice: 175, stock: 50, lowStockLimit: 10 },
        { name: 'Chana Dal (1kg)', purchasePrice: 120, sellingPrice: 150, stock: 45, lowStockLimit: 10 },
        { name: 'Aata (5kg)', purchasePrice: 280, sellingPrice: 330, stock: 35, lowStockLimit: 8 },
        { name: 'Maida (1kg)', purchasePrice: 55, sellingPrice: 70, stock: 30, lowStockLimit: 8 },
        { name: 'Moong Dal (500g)', purchasePrice: 80, sellingPrice: 100, stock: 25, lowStockLimit: 5 },
        { name: 'Rajma (500g)', purchasePrice: 95, sellingPrice: 120, stock: 20, lowStockLimit: 5 },
    ],
    'Oil & Ghee': [
        { name: 'Sunflower Oil (1L)', purchasePrice: 185, sellingPrice: 215, stock: 30, lowStockLimit: 8 },
        { name: 'Mustard Oil (1L)', purchasePrice: 195, sellingPrice: 230, stock: 25, lowStockLimit: 8 },
        { name: 'Swornim Ghiu (500g)', purchasePrice: 430, sellingPrice: 500, stock: 15, lowStockLimit: 4 },
        { name: 'Coconut Oil (500ml)', purchasePrice: 220, sellingPrice: 260, stock: 12, lowStockLimit: 3 },
    ],
    'Spices': [
        { name: 'Jeera (100g)', purchasePrice: 45, sellingPrice: 60, stock: 30, lowStockLimit: 8 },
        { name: 'Besar (Turmeric 100g)', purchasePrice: 35, sellingPrice: 50, stock: 35, lowStockLimit: 8 },
        { name: 'Dhania Powder (100g)', purchasePrice: 40, sellingPrice: 55, stock: 30, lowStockLimit: 8 },
        { name: 'Khursani Powder (100g)', purchasePrice: 50, sellingPrice: 70, stock: 25, lowStockLimit: 5 },
        { name: 'Garam Masala (50g)', purchasePrice: 55, sellingPrice: 75, stock: 20, lowStockLimit: 5 },
        { name: 'Tejpat (Bay Leaf 50g)', purchasePrice: 25, sellingPrice: 40, stock: 20, lowStockLimit: 5 },
    ],
    'Dairy & Eggs': [
        { name: 'Dairy Fresh Milk (1L)', purchasePrice: 80, sellingPrice: 100, stock: 20, lowStockLimit: 5 },
        { name: 'Dahi (500g)', purchasePrice: 65, sellingPrice: 85, stock: 15, lowStockLimit: 4 },
        { name: 'Amul Butter (100g)', purchasePrice: 55, sellingPrice: 70, stock: 12, lowStockLimit: 3 },
        { name: 'Anda (1 dozen)', purchasePrice: 180, sellingPrice: 210, stock: 25, lowStockLimit: 5 },
        { name: 'Processed Cheese (200g)', purchasePrice: 120, sellingPrice: 150, stock: 10, lowStockLimit: 3 },
    ],
    'Beverages': [
        { name: 'Wai Wai Chiya (250g)', purchasePrice: 120, sellingPrice: 150, stock: 25, lowStockLimit: 5 },
        { name: 'Goldrop Tea (500g)', purchasePrice: 290, sellingPrice: 350, stock: 20, lowStockLimit: 5 },
        { name: 'Nescafe Classic (50g)', purchasePrice: 180, sellingPrice: 220, stock: 10, lowStockLimit: 3 },
        { name: 'Coca Cola (1.5L)', purchasePrice: 95, sellingPrice: 120, stock: 30, lowStockLimit: 8 },
        { name: 'Real Juice Mango (1L)', purchasePrice: 100, sellingPrice: 130, stock: 20, lowStockLimit: 5 },
        { name: 'Pepsi (600ml)', purchasePrice: 55, sellingPrice: 70, stock: 35, lowStockLimit: 10 },
        { name: 'Sprite (600ml)', purchasePrice: 55, sellingPrice: 70, stock: 30, lowStockLimit: 10 },
    ],
    'Snacks': [
        { name: 'Wai Wai Noodles (75g)', purchasePrice: 20, sellingPrice: 28, stock: 100, lowStockLimit: 20 },
        { name: 'Maggi Noodles (70g)', purchasePrice: 17, sellingPrice: 24, stock: 80, lowStockLimit: 20 },
        { name: 'Parle-G Biscuit (100g)', purchasePrice: 12, sellingPrice: 18, stock: 60, lowStockLimit: 15 },
        { name: 'Good Day Biscuit (100g)', purchasePrice: 28, sellingPrice: 38, stock: 40, lowStockLimit: 10 },
        { name: 'Kurkure Masala (60g)', purchasePrice: 18, sellingPrice: 25, stock: 50, lowStockLimit: 10 },
        { name: "Lay's Classic (60g)", purchasePrice: 25, sellingPrice: 35, stock: 40, lowStockLimit: 10 },
        { name: 'Haldiram Mixture (200g)', purchasePrice: 70, sellingPrice: 90, stock: 20, lowStockLimit: 5 },
    ],
    'Soap & Hygiene': [
        { name: 'Lifebuoy Soap (125g)', purchasePrice: 38, sellingPrice: 50, stock: 30, lowStockLimit: 8 },
        { name: 'Dove Soap (100g)', purchasePrice: 75, sellingPrice: 95, stock: 20, lowStockLimit: 5 },
        { name: 'Colgate Toothpaste (200g)', purchasePrice: 130, sellingPrice: 160, stock: 15, lowStockLimit: 4 },
        { name: 'Pepsodent (200g)', purchasePrice: 115, sellingPrice: 145, stock: 15, lowStockLimit: 4 },
        { name: 'Head & Shoulders Shampoo (180ml)', purchasePrice: 165, sellingPrice: 210, stock: 12, lowStockLimit: 3 },
        { name: 'Pantene Shampoo (180ml)', purchasePrice: 175, sellingPrice: 220, stock: 10, lowStockLimit: 3 },
        { name: 'Dettol Handwash (200ml)', purchasePrice: 120, sellingPrice: 155, stock: 10, lowStockLimit: 3 },
        { name: 'Vim Dishwash (500g)', purchasePrice: 65, sellingPrice: 85, stock: 15, lowStockLimit: 4 },
    ],
    'Stationery': [
        { name: 'Big Kopi (200 pages)', purchasePrice: 55, sellingPrice: 75, stock: 20, lowStockLimit: 5 },
        { name: 'Small Kopi (100 pages)', purchasePrice: 30, sellingPrice: 45, stock: 25, lowStockLimit: 5 },
        { name: 'Reynolds Pen (Blue)', purchasePrice: 10, sellingPrice: 18, stock: 50, lowStockLimit: 10 },
        { name: 'Pencil HB', purchasePrice: 8, sellingPrice: 15, stock: 40, lowStockLimit: 10 },
        { name: 'Eraser (Big)', purchasePrice: 8, sellingPrice: 15, stock: 30, lowStockLimit: 8 },
    ],
};

const CUSTOMERS = [
    { name: 'Sita Devi Sharma', phone: '9841234567', address: 'Newroad-5, Pokhara' },
    { name: 'Ram Kumar Thapa', phone: '9856789012', address: 'Bagar, Pokhara-10' },
    { name: 'Gita Gurung', phone: '9866543210', address: 'Lakeside, Pokhara-6' },
    { name: 'Bishnu Prasad Poudel', phone: '9851098765', address: 'Prithvichowk, Pokhara-11' },
    { name: 'Maya Tamang', phone: '9847654321', address: 'Chipledhunga, Pokhara-8' },
    { name: 'Hari Bahadur Rai', phone: '9829876543', address: 'Sanepa, Pokhara-9' },
    { name: 'Kamala Devi Magar', phone: '9801234567', address: 'Nagdhunga, Pokhara-7' },
    { name: 'Suresh Adhikari', phone: '9844567890', address: 'Mahendrapul, Pokhara-11' },
    { name: 'Anita Shrestha', phone: '9869012345', address: 'Matepani, Pokhara-16' },
    { name: 'Krishna Prasad Bhandari', phone: '9852345678', address: 'Rambazar, Pokhara-13' },
    { name: 'Puja Oli', phone: '9808765432', address: 'Batulecharr, Pokhara-17' },
    { name: 'Dipak Karki', phone: '9823456789', address: 'Fishtail Gate, Pokhara-6' },
];

const EXPENSE_TEMPLATES = [
    { title: 'Bijuli Bill', category: 'Electricity', amountRange: [1500, 3500] },
    { title: 'Pasal Bhada', category: 'Rent', amountRange: [8000, 12000] },
    { title: 'Staff Tirphal', category: 'Salary', amountRange: [12000, 18000] },
    { title: 'Paani Bill', category: 'Water', amountRange: [200, 500] },
    { title: 'Gaadi Bhada (Delivery)', category: 'Transport', amountRange: [500, 1500] },
    { title: 'Chiya Khaja Staff', category: 'Food & Drinks', amountRange: [500, 1200] },
    { title: 'Maintenance / Repair', category: 'Other', amountRange: [800, 3000] },
    { title: 'Internet Bill', category: 'Other', amountRange: [700, 1500] },
];

// ─── Small delay helper to avoid overwhelming Supabase ───────────────────────
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    const userRepo = AppDataSource.getRepository(User);
    const shopRepo = AppDataSource.getRepository(Shop);
    const categoryRepo = AppDataSource.getRepository(Category);
    const productRepo = AppDataSource.getRepository(Product);
    const customerRepo = AppDataSource.getRepository(Customer);
    const saleRepo = AppDataSource.getRepository(Sale);
    const saleItemRepo = AppDataSource.getRepository(SaleItem);
    const khataRepo = AppDataSource.getRepository(KhataTransaction);
    const expenseRepo = AppDataSource.getRepository(Expense);
    const stockMovRepo = AppDataSource.getRepository(StockMovement);

    // ── 1. User + Shop ──────────────────────────────────────────────────────────
    console.log('👤 Creating demo user & shop...');

    const existingUser = await userRepo.findOne({ where: { email: DEMO_USER.email } });
    if (existingUser) {
        console.log('⚠️  Demo user already exists. Delete it first or change the email.\n');
        await AppDataSource.destroy();
        return;
    }

    const shop = shopRepo.create({
        name: DEMO_SHOP.name,
        address: DEMO_SHOP.address,
        phone: DEMO_SHOP.phone,
        plan: 'pro',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
    await shopRepo.save(shop);

    const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);
    const user = userRepo.create({
        name: DEMO_USER.name,
        email: DEMO_USER.email,
        password: hashedPassword,
        shop,
    });
    await userRepo.save(user);
    console.log(`   ✔ User: ${DEMO_USER.email} / ${DEMO_USER.password}`);
    console.log(`   ✔ Shop: ${DEMO_SHOP.name}\n`);

    // ── 2. Categories ───────────────────────────────────────────────────────────
    console.log('📦 Creating categories...');
    const categoryMap = new Map<string, Category>();

    for (const cat of CATEGORIES) {
        const c = categoryRepo.create({ ...cat, shop });
        await categoryRepo.save(c);
        categoryMap.set(cat.name, c);
    }
    console.log(`   ✔ ${CATEGORIES.length} categories created\n`);

    // ── 3. Products ─────────────────────────────────────────────────────────────
    console.log('🛒 Creating products...');
    const allProducts: Product[] = [];
    let productCount = 0;

    for (const [catName, items] of Object.entries(PRODUCTS_BY_CATEGORY)) {
        const category = categoryMap.get(catName)!;
        for (const item of items) {
            const color = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
            const imageUrl = `https://placehold.co/300x300/${color}/ffffff?text=${encodeURIComponent(item.name.split(' ')[0])}`;
            const p = productRepo.create({ ...item, shop, category, imageUrl, isActive: true });
            const saved = await productRepo.save(p);
            allProducts.push(saved);
            productCount++;
        }
    }
    console.log(`   ✔ ${productCount} products created\n`);

    // ── 4. Customers ────────────────────────────────────────────────────────────
    console.log('👥 Creating customers...');
    const savedCustomers: Customer[] = [];
    for (const c of CUSTOMERS) {
        const customer = customerRepo.create({ ...c, shop });
        const saved = await customerRepo.save(customer);
        savedCustomers.push(saved);
    }
    console.log(`   ✔ ${savedCustomers.length} customers created\n`);

    // ── 5. Sales — build all data in memory first, then bulk insert ─────────────
    console.log('🧾 Creating sales history (90 days)...');

    const allSales: Partial<Sale>[] = [];
    // store metadata alongside so we can build items + movements after insert
    const saleMeta: Array<{
        saleIndex: number;
        items: Array<{ product: Product; quantity: number; unitPrice: number; purchasePrice: number; subtotal: number; profit: number }>;
        customerId: number | null;
        dueAmount: number;
        saleDate: Date;
    }> = [];

    for (let day = 90; day >= 0; day--) {
        const salesCount = rand(4, 8);
        for (let s = 0; s < salesCount; s++) {
            const numItems = rand(1, 5);
            const chosenProducts = [...allProducts].sort(() => Math.random() - 0.5).slice(0, numItems);

            const items = chosenProducts.map((p) => {
                const qty = rand(1, 4);
                const unitPrice = Number(p.sellingPrice);
                const purchasePriceNum = Number(p.purchasePrice);
                const subtotal = unitPrice * qty;
                const profit = (unitPrice - purchasePriceNum) * qty;
                return { product: p, quantity: qty, unitPrice, purchasePrice: purchasePriceNum, subtotal, profit };
            });

            const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
            const discount = Math.random() < 0.15 ? Math.round(subtotal * 0.05) : 0;
            const totalAmount = subtotal - discount;

            const paymentRoll = Math.random();
            let paymentMethod: Sale['paymentMethod'];
            let paymentStatus: Sale['paymentStatus'];
            let paidAmount: number;
            let dueAmount: number;
            let customer: Customer | null = null;

            if (paymentRoll < 0.60) {
                paymentMethod = 'cash'; paymentStatus = 'paid';
                paidAmount = totalAmount; dueAmount = 0;
            } else if (paymentRoll < 0.75) {
                paymentMethod = 'qr'; paymentStatus = 'paid';
                paidAmount = totalAmount; dueAmount = 0;
            } else if (paymentRoll < 0.85) {
                customer = pick(savedCustomers);
                paymentMethod = 'credit'; paymentStatus = 'due';
                paidAmount = 0; dueAmount = totalAmount;
            } else if (paymentRoll < 0.92) {
                customer = pick(savedCustomers);
                paymentMethod = 'mixed'; paymentStatus = 'partial';
                paidAmount = Math.round(totalAmount * (rand(3, 7) / 10));
                dueAmount = totalAmount - paidAmount;
            } else {
                paymentMethod = 'bank'; paymentStatus = 'paid';
                paidAmount = totalAmount; dueAmount = 0;
            }

            const saleDate = daysAgo(day);

            allSales.push({
                shop,
                user,
                customer: customer || undefined,
                invoiceNumber: nextInvoice(),
                subtotal,
                discount,
                tax: 0,
                totalAmount,
                paidAmount,
                dueAmount,
                paymentMethod,
                paymentStatus,
                // createdAt set via raw SQL after insert
            });

            saleMeta.push({
                saleIndex: allSales.length - 1,
                items,
                customerId: customer?.id ?? null,
                dueAmount,
                saleDate,
            });
        }
    }

    // ✅ Bulk insert sales in chunks of 50 to avoid overwhelming Supabase
    const CHUNK = 50;
    const savedSales: Sale[] = [];

    for (let i = 0; i < allSales.length; i += CHUNK) {
        const chunk = allSales.slice(i, i + CHUNK);
        const entities = chunk.map(s => saleRepo.create(s as Sale));
        const saved = await saleRepo.save(entities);
        savedSales.push(...saved);
        process.stdout.write(`\r   Inserting sales... ${Math.min(i + CHUNK, allSales.length)}/${allSales.length}`);
        await sleep(100); // small breather between chunks
    }
    console.log(`\n   ✔ ${savedSales.length} sales inserted`);

    // ✅ Fix created_at via raw SQL (CreateDateColumn ignores manual values)
    console.log('   Fixing sale timestamps...');
    for (let i = 0; i < saleMeta.length; i++) {
        const meta = saleMeta[i];
        const sale = savedSales[i];
        await AppDataSource.query(
            `UPDATE sales SET created_at = $1, updated_at = $1 WHERE id = $2`,
            [meta.saleDate, sale.id]
        );
        sale.createdAt = meta.saleDate; // keep in-memory in sync
    }

    // ✅ Bulk insert sale items + stock movements
    console.log('   Inserting sale items & stock movements...');
    const allSaleItems: Partial<SaleItem>[] = [];
    const allStockMovements: Partial<StockMovement>[] = [];
    const creditSalesByCustomer = new Map<number, { sale: Sale; dueAmount: number }[]>();

    for (let i = 0; i < saleMeta.length; i++) {
        const meta = saleMeta[i];
        const sale = savedSales[i];

        for (const item of meta.items) {
            allSaleItems.push({ ...item, sale });
            allStockMovements.push({
                shop,
                product: item.product,
                type: 'out',
                quantity: item.quantity,
                referenceType: 'sale',
                referenceId: sale.id,
                // createdAt fixed below
            });
        }

        if (meta.customerId && meta.dueAmount > 0) {
            const customer = savedCustomers.find(c => c.id === meta.customerId)!;
            const existing = creditSalesByCustomer.get(meta.customerId) || [];
            existing.push({ sale, dueAmount: meta.dueAmount });
            creditSalesByCustomer.set(meta.customerId, existing);
        }
    }

    // Bulk insert sale items in chunks
    for (let i = 0; i < allSaleItems.length; i += CHUNK) {
        const chunk = allSaleItems.slice(i, i + CHUNK);
        await saleItemRepo.save(chunk.map(si => saleItemRepo.create(si as SaleItem)));
        await sleep(80);
    }
    console.log(`   ✔ ${allSaleItems.length} sale items inserted`);

    // Bulk insert stock movements in chunks
    for (let i = 0; i < allStockMovements.length; i += CHUNK) {
        const chunk = allStockMovements.slice(i, i + CHUNK);
        await stockMovRepo.save(chunk.map(sm => stockMovRepo.create(sm as StockMovement)));
        await sleep(80);
    }
    console.log(`   ✔ ${allStockMovements.length} stock movements inserted\n`);

    // ── 6. Khata Transactions ───────────────────────────────────────────────────
    console.log('📒 Creating khata transactions...');
    const allKhata: Partial<KhataTransaction>[] = [];

    for (const [customerId, creditSales] of creditSalesByCustomer.entries()) {
        const customer = savedCustomers.find(c => c.id === customerId)!;

        for (const { sale, dueAmount } of creditSales) {
            allKhata.push({
                shop, customer, type: 'credit', amount: dueAmount,
                note: `Udhaaro - Invoice ${sale.invoiceNumber}`,
                sale,
                // createdAt fixed below
            });

            if (Math.random() < 0.5) {
                const paymentAmount = Math.random() < 0.5
                    ? dueAmount
                    : Math.round(dueAmount * (rand(3, 8) / 10));
                allKhata.push({
                    shop, customer, type: 'payment', amount: paymentAmount,
                    note: 'Nakad Bhuktan',
                    // createdAt fixed below
                });
            }
        }
    }

    for (let i = 0; i < allKhata.length; i += CHUNK) {
        const chunk = allKhata.slice(i, i + CHUNK);
        await khataRepo.save(chunk.map(k => khataRepo.create(k as KhataTransaction)));
        await sleep(80);
    }
    console.log(`   ✔ ${allKhata.length} khata transactions created\n`);

    // ── 7. Expenses ─────────────────────────────────────────────────────────────
    console.log('💸 Creating expenses...');
    const allExpenses: Partial<Expense>[] = [];

    for (let month = 0; month < 3; month++) {
        for (const tmpl of EXPENSE_TEMPLATES) {
            const amount = rand(tmpl.amountRange[0], tmpl.amountRange[1]);
            const expenseDate = new Date();
            expenseDate.setMonth(expenseDate.getMonth() - month);
            expenseDate.setDate(rand(1, 28));
            allExpenses.push({
                shop, title: tmpl.title, category: tmpl.category, amount,
                note: `${tmpl.title} - ${expenseDate.toLocaleString('en-NP', { month: 'long', year: 'numeric' })}`,
                date: dateStr(expenseDate),
            });
        }
    }

    await expenseRepo.save(allExpenses.map(e => expenseRepo.create(e as Expense)));
    console.log(`   ✔ ${allExpenses.length} expenses created\n`);

    // ── Summary ─────────────────────────────────────────────────────────────────
    console.log('═══════════════════════════════════════');
    console.log('🎉 Demo seed complete!');
    console.log('═══════════════════════════════════════');
    console.log(`  👤 Login Email : ${DEMO_USER.email}`);
    console.log(`  🔑 Password    : ${DEMO_USER.password}`);
    console.log(`  🏪 Shop        : ${DEMO_SHOP.name}`);
    console.log(`  📦 Categories  : ${CATEGORIES.length}`);
    console.log(`  🛒 Products    : ${productCount}`);
    console.log(`  👥 Customers   : ${savedCustomers.length}`);
    console.log(`  🧾 Sales       : ${savedSales.length}`);
    console.log(`  📒 Khata txns  : ${allKhata.length}`);
    console.log(`  💸 Expenses    : ${allExpenses.length}`);
    console.log('═══════════════════════════════════════\n');

    await AppDataSource.destroy();
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});






/*
🎉 Demo seed complete!
═══════════════════════════════════════
  👤 Login Email : demo@sajilokhata.com
  🔑 Password    : demo1234
  🏪 Shop        : Shrestha Kirana Pasal
  📦 Categories  : 8
  🛒 Products    : 50
  👥 Customers   : 12
  🧾 Sales       : 554
  📒 Khata txns  : 142
  💸 Expenses    : 24


*/