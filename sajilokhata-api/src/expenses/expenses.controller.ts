import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post
} from "@nestjs/common";


import { CurrentUser } from "../auth/decorators/current-user.decorator";

import { ExpensesService } from "./expenses.service";

import { CreateExpenseDto } from "./dto";

@Controller("expenses")
// @UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
  ) { }

  // =====================================
  // CREATE
  // =====================================
  @Post()
  create(
    @Body()
    dto: CreateExpenseDto,

    @CurrentUser()
    user: any,
  ) {
    return this.expensesService.create(
      dto,
      user.shopId,
    );
  }

  // =====================================
  // GET ALL
  // =====================================
  @Get()
  findAll(
    @CurrentUser()
    user: any,
  ) {
    return this.expensesService.findAll(
      user.shopId,
    );
  }

  // =====================================
  // GET ONE
  // =====================================
  @Get(":id")
  findOne(
    @Param("id", ParseIntPipe)
    id: number,

    @CurrentUser()
    user: any,
  ) {
    return this.expensesService.findOne(
      id,
      user.shopId,
    );
  }

  // =====================================
  // DELETE
  // =====================================
  @Delete(":id")
  remove(
    @Param("id", ParseIntPipe)
    id: number,

    @CurrentUser()
    user: any,
  ) {
    return this.expensesService.remove(
      id,
      user.shopId,
    );
  }
}