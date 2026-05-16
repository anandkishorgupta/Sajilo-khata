// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { ExpensesModule } from './expenses/expenses.module';
import { KhataModule } from './khata/khata.module';
import { ProductsModule } from './products/products.module';
import { PurchasesModule } from './purchases/purchases.module';
import { SalesModule } from './sales/sales.module';
import { ShopsModule } from './shops/shops.module';
import { UsersModule } from './users/users.module';
import { ImagekitModule } from './imagekit/imagekit.module';
import { SaleItemsModule } from './sale-items/sale-items.module';
import { PurchaseItemsModule } from './purchase-items/purchase-items.module';
import { KhataTransactionsModule } from './khata-transactions/khata-transactions.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';

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
    KhataModule,
    ImagekitModule,
    SaleItemsModule,
    PurchaseItemsModule,
    KhataTransactionsModule,
    StockMovementsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }