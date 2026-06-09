// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CustomersModule } from './customers/customers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ImagekitModule } from './imagekit/imagekit.module';
import { InvoicesModule } from './invoices/invoices.module';
import { KhataTransactionsModule } from './khata-transactions/khata-transactions.module';
import { ProductsModule } from './products/products.module';
import { PurchasesModule } from './purchases/purchases.module';
import { SalesModule } from './sales/sales.module';
import { ShopsModule } from './shops/shops.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({          // ✅ switched to async
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      dataSourceFactory: async (options) => {  // ✅ registers DataSource for @Transactional()
        if (!options) throw new Error('TypeORM DataSource options are undefined');
        const dataSource = await new DataSource(options).initialize();
        return addTransactionalDataSource(dataSource);
      },
    }),

    AuthModule,
    ShopsModule,
    UsersModule,
    ProductsModule,
    CustomersModule,
    SalesModule,
    PurchasesModule,
    ExpensesModule,
    ImagekitModule,
    KhataTransactionsModule,
    StockMovementsModule,
    DashboardModule,
    InvoicesModule,
    CategoriesModule,
    AiAssistantModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }