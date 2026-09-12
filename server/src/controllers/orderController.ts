import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import {
  createOrderSchema,
  deleteOrderItemSchema,
  getOrdersQuerySchema,
  updateOrderSchema,
  updateOrderStatusSchema,
} from '../utils/validation.js';
import { saveOrderItemFiles } from '../utils/orderFiles.js';
import { getDeliveryCost } from '../utils/deliveryRates.js';
import { sendOrderNotificationEmail } from '../utils/orderNotificationEmail.js';

const SUCCESSFUL_REVENUE_STATUSES = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

const generateOrderNumber = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const count = await prisma.order.count();
    const orderNumber = `NZ-${String(count + attempt + 1).padStart(6, '0')}`;
    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    if (!existing) return orderNumber;
  }

  return `NZ-${Date.now().toString().slice(-9)}`;
};

const statusTimestampField = (status: string) => {
  if (status === 'CONFIRMED') return 'confirmedAt';
  if (status === 'PROCESSING') return 'processingAt';
  if (status === 'SHIPPED') return 'shippedAt';
  if (status === 'DELIVERED') return 'deliveredAt';
  if (status === 'CANCELLED') return 'cancelledAt';
  return null;
};

const orderInclude = {
  items: {
    orderBy: { createdAt: 'asc' as const },
  },
};

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  console.log('[ORDER] Request received');
  const payload = createOrderSchema.parse(req.body);
  console.log('[ORDER] Validation passed');

  const productIds = [...new Set(payload.items.map(item => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
    include: { variants: true },
  });
  console.log('[ORDER] Products loaded:', products.length);
  const productById = new Map(products.map(product => [product.id, product]));

  const items = payload.items.map(item => {
    const product = productById.get(item.productId);
    if (!product) throw new AppError('One or more products are unavailable.', 400);

    const variant = item.variantId
      ? product.variants.find(candidate => candidate.id === item.variantId)
      : product.variants.find(candidate => candidate.color === item.color && candidate.size === item.size);

    if (!variant || !variant.available) {
      throw new AppError(`${product.name} is not available in ${item.color} / ${item.size}.`, 400);
    }

    // Stock validation removed - assume unlimited stock
    // if (variant.stock <= 0) {
    //   throw new AppError(`${product.name} is out of stock in ${item.color} / ${item.size}.`, 400);
    // }

    const unitPrice = variant.priceOverride ?? product.price;
    return {
      ...item,
      variantId: variant.id,
      product,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryCost = getDeliveryCost(payload.customer.wilaya, payload.customer.deliveryMethod);
  if (deliveryCost === null) {
    throw new AppError('Unable to determine delivery cost for the selected wilaya.', 400);
  }
  const total = subtotal + deliveryCost;
  console.log('[ORDER] Totals calculated:', { subtotal, deliveryCost, total });

  const orderNumber = await generateOrderNumber();
  console.log('[ORDER] Order number generated:', orderNumber);

  console.log('[ORDER] Processing files for', items.length, 'items');
  const savedFiles = await Promise.all(
    items.map((item, index) => saveOrderItemFiles(orderNumber, index + 1, item))
  );
  console.log('[ORDER] Files processed');

  console.log('[ORDER] Creating order in database');
  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: payload.customer.customerName,
      phone: payload.customer.phone,
      wilaya: payload.customer.wilaya,
      deliveryType: payload.customer.deliveryMethod,
      baladia: payload.customer.baladia,
      address: payload.customer.address ?? '',
      subtotal,
      deliveryCost,
      total,
      paymentMethod: 'COD',
      items: {
        create: items.map((item, index) => ({
          productId: item.productId,
          variantId: item.variantId,
          productNameSnapshot: item.product.name,
          unitPriceSnapshot: item.unitPrice,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          fit: item.fit || 'regular',
          customizationData: item.customizationData as object,
          ...savedFiles[index],
        })),
      },
    },
    include: orderInclude,
  });
  console.log('[ORDER] Order created:', order.id);

  sendOrderNotificationEmail({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    wilaya: order.wilaya,
    total: order.total,
  }).catch(err => {
    console.error('[ORDER] Failed to send notification email:', err);
  });

  console.log('[ORDER] Preparing response');
  const responseData = { status: 'success', data: { order } };
  console.log('[ORDER] Sending response');
  res.status(201).json(responseData);
  console.log('[ORDER] Response sent successfully');
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const query = getOrdersQuerySchema.parse(req.query);
  const limit = query.limit ? Math.min(parseInt(query.limit), 100) : 20;
  const offset = query.offset ? parseInt(query.offset) : 0;
  const where: Record<string, unknown> = {};

  if (query.status) where.status = query.status;
  if (query.wilaya) where.wilaya = { contains: query.wilaya, mode: 'insensitive' };
  if (query.search) {
    where.OR = [
      { orderNumber: { contains: query.search, mode: 'insensitive' } },
      { customerName: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.dateFrom || query.dateTo) {
    where.createdAt = {
      ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
      ...(query.dateTo && { lte: new Date(query.dateTo) }),
    };
  }

  const orderBy = query.sort === 'oldest'
    ? { createdAt: 'asc' as const }
    : query.sort === 'total'
      ? { total: 'desc' as const }
      : { createdAt: 'desc' as const };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: { select: { id: true, quantity: true } } },
      orderBy,
      take: limit,
      skip: offset,
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    status: 'success',
    data: {
      orders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + orders.length < total,
      },
    },
  });
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: String(req.params.id) },
    include: orderInclude,
  });

  if (!order) throw new AppError('Order not found', 404);
  res.json({ status: 'success', data: { order } });
});

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const payload = updateOrderSchema.parse(req.body);
  const currentOrder = await prisma.order.findUnique({
    where: { id: String(req.params.id) },
    include: { items: true },
  });
  if (!currentOrder) throw new AppError('Order not found', 404);

  const itemQuantities = new Map(payload.items?.map(item => [item.id, item.quantity]) ?? []);
  const nextItems = currentOrder.items.map(item => ({
    ...item,
    quantity: itemQuantities.get(item.id) ?? item.quantity,
  }));
  const subtotal = nextItems.reduce((sum, item) => sum + item.unitPriceSnapshot * item.quantity, 0);
  const deliveryCost = payload.deliveryCost ?? currentOrder.deliveryCost;
  const total = subtotal + deliveryCost;

  const order = await prisma.$transaction(async transaction => {
    for (const item of payload.items ?? []) {
      await transaction.orderItem.update({
        where: { id: item.id },
        data: { quantity: item.quantity },
      });
    }

    return transaction.order.update({
      where: { id: currentOrder.id },
      data: {
        customerName: payload.customerName,
        phone: payload.phone,
        wilaya: payload.wilaya,
        baladia: payload.baladia,
        address: payload.address,
        deliveryCost,
        subtotal,
        total,
      },
      include: orderInclude,
    });
  });

  res.json({ status: 'success', data: { order } });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const payload = updateOrderStatusSchema.parse(req.body);
  if (payload.status === 'CANCELLED' && !payload.cancellationReason?.trim()) {
    throw new AppError('Cancellation reason is required.', 400);
  }

  const now = new Date();
  const timestamp = statusTimestampField(payload.status);
  const data: Record<string, unknown> = {
    status: payload.status,
    cancellationReason: payload.status === 'CANCELLED' ? payload.cancellationReason : null,
  };

  if (timestamp) data[timestamp] = now;

  const order = await prisma.order.update({
    where: { id: String(req.params.id) },
    data,
    include: orderInclude,
  });

  res.json({ status: 'success', data: { order } });
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: String(req.params.id) },
    include: { items: true },
  });
  if (!order) throw new AppError('Order not found', 404);

  await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
  await prisma.order.delete({ where: { id: order.id } });

  res.json({ status: 'success', message: 'Order deleted' });
});

export const deleteOrderItem = asyncHandler(async (req: Request, res: Response) => {
  const { itemId } = deleteOrderItemSchema.parse(req.params);
  const orderId = String(req.params.id);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new AppError('Order not found', 404);

  const item = order.items.find(candidate => candidate.id === itemId);
  if (!item) throw new AppError('Item not found in this order', 404);

  await prisma.orderItem.delete({ where: { id: itemId } });

  const remainingItems = await prisma.orderItem.findMany({
    where: { orderId },
    orderBy: { createdAt: 'asc' },
  });

  const subtotal = remainingItems.reduce((sum, current) => sum + current.unitPriceSnapshot * current.quantity, 0);
  const deliveryCost = order.deliveryCost;
  const total = subtotal + deliveryCost;

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { subtotal, total },
    include: orderInclude,
  });

  res.json({ status: 'success', data: { order: updatedOrder } });
});

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const revenueWhere = { status: { in: [...SUCCESSFUL_REVENUE_STATUSES] } };

  const [
    revenueOrders,
    totalOrders,
    statusGroups,
    items,
    recentOrders,
    timelineOrders,
  ] = await Promise.all([
    prisma.order.findMany({ where: revenueWhere, select: { total: true, createdAt: true } }),
    prisma.order.count(),
    prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.orderItem.findMany({
      where: { order: revenueWhere },
      select: { productNameSnapshot: true, quantity: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, orderNumber: true, customerName: true, total: true, status: true, createdAt: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, total: true, status: true },
    }),
  ]);

  const revenue = revenueOrders.reduce((sum, order) => sum + order.total, 0);
  const revenueFrom = (from: Date) => revenueOrders
    .filter(order => order.createdAt >= from)
    .reduce((sum, order) => sum + order.total, 0);
  const itemsSold = items.reduce((sum, item) => sum + item.quantity, 0);
  const topProducts = Object.values(items.reduce<Record<string, { product: string; quantity: number }>>((acc, item) => {
    const product = item.productNameSnapshot;
    acc[product] = acc[product] ?? { product, quantity: 0 };
    acc[product].quantity += item.quantity;
    return acc;
  }, {})).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  const ordersByDay = Object.values(timelineOrders.reduce<Record<string, { date: string; orders: number; revenue: number }>>((acc, order) => {
    const date = order.createdAt.toISOString().slice(0, 10);
    acc[date] = acc[date] ?? { date, orders: 0, revenue: 0 };
    acc[date].orders += 1;
    if ((SUCCESSFUL_REVENUE_STATUSES as readonly string[]).includes(order.status)) {
      acc[date].revenue += order.total;
    }
    return acc;
  }, {})).slice(-14);

  const statusCounts = Object.fromEntries(statusGroups.map(group => [group.status, group._count.status]));

  res.json({
    status: 'success',
    data: {
      totalRevenue: revenue,
      todayRevenue: revenueFrom(today),
      weekRevenue: revenueFrom(weekStart),
      monthRevenue: revenueFrom(monthStart),
      totalOrders,
      statusCounts,
      itemsSold,
      averageOrderValue: revenueOrders.length ? revenue / revenueOrders.length : 0,
      topProducts,
      recentOrders,
      ordersByDay,
    },
  });
});
