// src/scan/scan.gateway.ts
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PosSessionsService } from '../pos-sessions/pos-sessions.service';
import { ProductsService } from '../products/products.service';

// Map socketId → sessionCode (for cleanup on disconnect)
const socketToSession = new Map<string, string>();
// Map sessionCode → phoneSocketId (latest phone in session)
const sessionToPhone = new Map<string, string>();

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/scan',
})
export class ScanGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ScanGateway.name);

  constructor(
    private readonly sessions: PosSessionsService,
    private readonly products: ProductsService,
  ) { }

  // ─── Laptop registers ───────────────────────────────────────────
  @SubscribeMessage('scan:register-laptop')
  async handleRegisterLaptop(
    @MessageBody() { sessionCode }: { sessionCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    const session = await this.sessions.findByCode(sessionCode);
    if (!session) {
      client.emit('scan:error', { message: 'Invalid or expired session' });
      return;
    }

    await this.sessions.setLaptopSocket(sessionCode, client.id);
    client.join(`session:${sessionCode}`);
    socketToSession.set(client.id, sessionCode);

    client.emit('scan:registered', { sessionCode });
    this.logger.log(`Laptop registered: ${sessionCode}`);

    // Tell the phone (if already connected) that the laptop is now online
    const phoneId = sessionToPhone.get(sessionCode);
    if (phoneId) {
      this.server.to(phoneId).emit('scan:laptop-online');
    }
  }

  // ─── Phone joins session ─────────────────────────────────────────
  @SubscribeMessage('scan:join')
  async handlePhoneJoin(
    @MessageBody() { sessionCode }: { sessionCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    const session = await this.sessions.findByCode(sessionCode);
    if (!session) {
      client.emit('scan:error', { message: 'Invalid or expired session' });
      return;
    }

    client.join(`session:${sessionCode}`);
    socketToSession.set(client.id, sessionCode);
    sessionToPhone.set(sessionCode, client.id);

    // Include actual laptop presence in the response
    client.emit('scan:joined', {
      sessionCode,
      shopId: session.shopId,
      laptopOnline: !!session.laptopSocketId,
    });
    this.logger.log(
      `Phone joined: ${sessionCode} (laptop online: ${!!session.laptopSocketId})`,
    );
  }

  // ─── Phone scans barcode ─────────────────────────────────────────
  @SubscribeMessage('scan:product')
  async handleScan(
    @MessageBody() { barcode, sessionCode }: {
      barcode: string;
      sessionCode: string;
    },
    @ConnectedSocket() phone: Socket,
  ) {
    console.log(`Scan request: ${barcode} in session ${sessionCode}`);
    const session = await this.sessions.findByCode(sessionCode);
    if (!session || !session.laptopSocketId) {
      phone.emit('scan:error', {
        barcode,
        message: session ? 'Laptop not connected' : 'Session invalid',
      });
      return;
    }

    const product = await this.products.findByBarcode(barcode, session.shopId);

    if (!product) {
      phone.emit('scan:error', {
        barcode,
        message: 'Product not found'
      });
      return;
    }

    if (product.stock <= 0) {
      phone.emit('scan:error', {
        barcode,
        message: `${product.name} is out of stock`,
      });
      return;
    }

    // Send to this laptop
    this.server.to(session.laptopSocketId).emit('cart:product-found', {
      product: {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        sellingPrice: product.sellingPrice,
        stock: product.stock,
      },
      phoneSocketId: phone.id,
    });
  }

  // ─── Laptop ACKs after updating cart ────────────────────────────
  @SubscribeMessage('scan:accepted')
  handleCartAck(
    @MessageBody() payload: {
      phoneSocketId: string;
      product: { id: number; name: string; sellingPrice: number; barcode: string };
      quantity: number;
      cartTotal: number;
      itemCount: number;
    },
  ) {
    this.server.to(payload.phoneSocketId).emit('scan:confirmed', {
      product: payload.product,
      quantity: payload.quantity,
      cartTotal: payload.cartTotal,
      itemCount: payload.itemCount,
      barcode: payload.product.barcode, // Add barcode for tracking
    });
  }

  @SubscribeMessage("scan:duplicate")
  handleDuplicate(
    @MessageBody()
    payload: {
      phoneSocketId: string;
      product: { id: number; name: string; barcode: string };
    },
  ) {
    this.server.to(payload.phoneSocketId).emit("scan:duplicate", {
      barcode: payload.product.barcode,
      message: "Already in cart. Increase quantity from the laptop.",
    });
  }


  // ─── Cleanup on disconnect ───────────────────────────────────────
  async handleDisconnect(client: Socket) {
    const sessionCode = socketToSession.get(client.id);
    if (!sessionCode) return;

    socketToSession.delete(client.id);

    const session = await this.sessions.findByCode(sessionCode);
    if (session?.laptopSocketId === client.id) {
      await this.sessions.setLaptopSocket(sessionCode, null);
      const phoneId = sessionToPhone.get(sessionCode);
      if (phoneId) {
        this.server.to(phoneId).emit('scan:laptop-disconnected');
      }
    }
  }
}