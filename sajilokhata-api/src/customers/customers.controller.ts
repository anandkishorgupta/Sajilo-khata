import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";

import { CustomersService } from "./customers.service";

import {
  CreateCustomerDto,
  UpdateCustomerDto,
} from "./dto";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("customers")
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
  ) {}

  // CREATE CUSTOMER
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body()
    dto: CreateCustomerDto,

    @CurrentUser()
    user: any,
  ) {
    return this.customersService.create(
      dto,
      user.shopId,
    );
  }

  // GET ALL CUSTOMERS
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @CurrentUser()
    user: any,
  ) {
    return this.customersService.findAll(
      user.shopId,
    );
  }

  // GET SINGLE CUSTOMER
  @Get(":id")
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param("id", ParseIntPipe)
    id: number,

    @CurrentUser()
    user: any,
  ) {
    return this.customersService.findOne(
      id,
      user.shopId,
    );
  }

  // UPDATE CUSTOMER
  @Put(":id")
  @UseGuards(JwtAuthGuard)
  update(
    @Param("id", ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateCustomerDto,

    @CurrentUser()
    user: any,
  ) {
    return this.customersService.update(
      id,
      dto,
      user.shopId,
    );
  }

  // DELETE CUSTOMER
  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  remove(
    @Param("id", ParseIntPipe)
    id: number,

    @CurrentUser()
    user: any,
  ) {
    return this.customersService.remove(
      id,
      user.shopId,
    );
  }
}