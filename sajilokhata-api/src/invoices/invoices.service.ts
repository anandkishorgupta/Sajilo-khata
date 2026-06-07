import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import PDFDocument from "pdfkit";

import type { Response } from "express";

import { Sale } from "../sales/entities";
import puppeteer from "puppeteer";
import { buildInvoiceHtml } from "./invoice.template";



@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,
  ) { }

  // =====================================
  // GENERATE PDF INVOICE
  // =====================================
  private async findSale(saleId: number, shopId: number) {
    const sale = await this.saleRepo.findOne({
      where: { id: saleId, shop: { id: shopId } },
      relations: { shop: true, customer: true, items: { product: true } },
    });
    if (!sale) throw new NotFoundException("Sale not found");
    return sale;
  }

  async generateInvoice(saleId: number, shopId: number, res: Response) {
    const sale = await this.findSale(saleId, shopId);
    const html = buildInvoiceHtml(sale);

    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await new Promise(resolve => setTimeout(resolve, 100));

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=invoice-${sale.invoiceNumber}.pdf`);
    res.end(pdf);
  }










  // =====================================
  // THERMAL RECEIPT
  // =====================================
  async thermalReceipt(
    saleId: number,
    shopId: number,
    res: Response,
  ) {
    const sale = await this.saleRepo.findOne({
      where: {
        id: saleId,

        shop: {
          id: shopId,
        },
      },

      relations: {
        shop: true,
        customer: true,
        items: {
          product: true,
        },
      },
    });

    if (!sale) {
      throw new NotFoundException(
        "Sale not found",
      );
    }

    const doc = new PDFDocument({
      size: [220, 600],
      margin: 10,
    });

    res.setHeader(
      "Content-Type",
      "application/pdf",
    );

    doc.pipe(res);

    // =====================================
    // HEADER
    // =====================================

    doc
      .fontSize(14)
      .text(
        sale.shop.name || "SHOP",
        {
          align: "center",
        },
      );

    doc.text(
      "------------------------------",
    );

    doc.fontSize(9);

    doc.text(
      `Invoice: ${sale.invoiceNumber}`,
    );

    doc.text(
      sale.createdAt.toLocaleString(),
    );

    doc.text(
      "------------------------------",
    );

    // =====================================
    // ITEMS
    // =====================================

    for (const item of sale.items) {
      doc.text(item.product.name);

      doc.text(
        `${item.quantity} x ${item.unitPrice} = ${item.subtotal}`,
      );

      doc.moveDown(0.5);
    }

    doc.text(
      "------------------------------",
    );

    // =====================================
    // TOTAL
    // =====================================

    doc.text(
      `TOTAL: Rs. ${sale.totalAmount}`,
      {
        align: "right",
      },
    );

    doc.text(
      `PAID: Rs. ${sale.paidAmount}`,
      {
        align: "right",
      },
    );

    doc.text(
      `DUE: Rs. ${sale.dueAmount}`,
      {
        align: "right",
      },
    );

    doc.moveDown();

    doc.text(
      "Thank You!",
      {
        align: "center",
      },
    );

    doc.end();
  }
}