import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import PDFDocument from "pdfkit";

import type { Response } from "express";

import { Sale } from "../sales/entities";

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,
  ) {}

  // =====================================
  // GENERATE PDF INVOICE
  // =====================================
  async generateInvoice(
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
      margin: 40,
    });

    // =====================================
    // RESPONSE HEADERS
    // =====================================

    res.setHeader(
      "Content-Type",
      "application/pdf",
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=invoice-${sale.invoiceNumber}.pdf`,
    );

    doc.pipe(res);

    // =====================================
    // SHOP INFO
    // =====================================

    doc
      .fontSize(22)
      .text(
        sale.shop.name || "Shop Invoice",
        {
          align: "center",
        },
      );

    doc.moveDown();

    // =====================================
    // INVOICE INFO
    // =====================================

    doc
      .fontSize(12)
      .text(
        `Invoice Number: ${sale.invoiceNumber}`,
      );

    doc.text(
      `Date: ${sale.createdAt.toDateString()}`,
    );

    if (sale.customer) {
      doc.text(
        `Customer: ${sale.customer.name}`,
      );
    }

    doc.moveDown();

    // =====================================
    // TABLE HEADER
    // =====================================

    doc
      .fontSize(13)
      .text("Items", 50);

    doc.text("Qty", 300);

    doc.text("Price", 370);

    doc.text("Total", 470);

    doc.moveDown();

    // =====================================
    // ITEMS
    // =====================================

    for (const item of sale.items) {
      doc.text(
        item.product.name,
        50,
      );

      doc.text(
        item.quantity.toString(),
        300,
      );

      doc.text(
        Number(
          item.unitPrice,
        ).toFixed(2),
        370,
      );

      doc.text(
        Number(
          item.subtotal,
        ).toFixed(2),
        470,
      );

      doc.moveDown();
    }

    doc.moveDown();

    // =====================================
    // TOTALS
    // =====================================

    doc.text(
      `Subtotal: Rs. ${Number(
        sale.subtotal,
      ).toFixed(2)}`,
      {
        align: "right",
      },
    );

    doc.text(
      `Discount: Rs. ${Number(
        sale.discount,
      ).toFixed(2)}`,
      {
        align: "right",
      },
    );

    doc.text(
      `Tax: Rs. ${Number(
        sale.tax,
      ).toFixed(2)}`,
      {
        align: "right",
      },
    );

    doc
      .fontSize(16)
      .text(
        `Grand Total: Rs. ${Number(
          sale.totalAmount,
        ).toFixed(2)}`,
        {
          align: "right",
        },
      );

    doc.text(
      `Paid: Rs. ${Number(
        sale.paidAmount,
      ).toFixed(2)}`,
      {
        align: "right",
      },
    );

    doc.text(
      `Due: Rs. ${Number(
        sale.dueAmount,
      ).toFixed(2)}`,
      {
        align: "right",
      },
    );

    doc.moveDown(2);

    // =====================================
    // FOOTER
    // =====================================

    doc
      .fontSize(11)
      .text(
        "Thank you for your purchase!",
        {
          align: "center",
        },
      );

    doc.end();
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