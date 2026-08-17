// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { SubscriptionGuard } from './auth/guards/subscription.guard';
import { CategoriesModule } from './categories/categories.module';
import { CustomersModule } from './customers/customers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ImagekitModule } from './imagekit/imagekit.module';
import { InvoicesModule } from './invoices/invoices.module';
import { KhataTransactionsModule } from './khata-transactions/khata-transactions.module';
import { PaymentModule } from './payment/payment.module';
import { ProductsModule } from './products/products.module';
import { PurchasesModule } from './purchases/purchases.module';
import { SalesModule } from './sales/sales.module';
import { Shop } from './shops/entities';
import { ShopsModule } from './shops/shops.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { UsersModule } from './users/users.module';
import { StaffModule } from './staff/staff.module';
import { PosSessionsModule } from './pos-sessions/pos-sessions.module';
import { ScanGateway } from './scan/scan.gateway';
import { ScanModule } from './scan/scan.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({          //  switched to async
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      dataSourceFactory: async (options) => {  // registers DataSource for @Transactional()
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
    AiAssistantModule,
    PaymentModule,
    TypeOrmModule.forFeature([Shop]),
    PosSessionsModule,
    ScanModule,
    StaffModule,
  ],
  controllers: [AppController],
  providers: [AppService
    ,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: SubscriptionGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    // ScanGateway,
  ],
})
export class AppModule { }