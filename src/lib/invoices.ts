import type { Invoice, Order, Product } from '@/payload-types';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { createWorkerConverter } from '@matbee/libreoffice-converter/server';
import type { Payload } from 'payload';

const PRODUCT_VAT_RATE = 0.11;
const DELIVERY_VAT_RATE = 0.21;

const roundToCents = (value: number) => Math.round(value * 100) / 100;
const formatAmount = (value: number) => roundToCents(value).toFixed(2);

const getBucharestDate = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Europe/Bucharest',
    year: 'numeric'
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.day}-${values.month}-${values.year}`;
};

const getBillingAddress = (order: Order) => {
  const transaction = order.transactions?.find(
    (item) => item && typeof item === 'object' && item.billingAddress
  );

  return transaction && typeof transaction === 'object'
    ? transaction.billingAddress
    : undefined;
};

const getProductPrice = (product: Product) => {
  return Number(
    product.hasDiscount && product.discountedPrice
      ? product.discountedPrice
      : product.price
  );
};

const getOrCreateInvoice = async ({
  order,
  payload
}: {
  order: Order;
  payload: Payload;
}) => {
  const existing = await payload.find({
    collection: 'invoices',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      order: {
        equals: order.id
      }
    }
  });

  if (existing.docs[0]) return existing.docs[0];

  return payload.create({
    collection: 'invoices',
    data: {
      issuedAt: new Date().toISOString(),
      order: order.id
    },
    overrideAccess: true
  });
};

const buildInvoiceData = ({
  customerEmail,
  invoice,
  order
}: {
  customerEmail: string;
  invoice: Invoice;
  order: Order;
}) => {
  const billingAddress = getBillingAddress(order);
  const productLines = (order.items || []).map((item, index) => {
    if (!item.product || typeof item.product !== 'object') {
      throw new Error(`Could not load product for invoice item ${index + 1}.`);
    }

    const quantity = Number(item.quantity) || 0;
    const grossUnitPrice = getProductPrice(item.product);
    const grossTotal = roundToCents(grossUnitPrice * quantity);
    const totalNoVAT = roundToCents(grossTotal / (1 + PRODUCT_VAT_RATE));

    return {
      count: index + 1,
      grossTotal,
      name: item.product.name,
      pricePerUnit: formatAmount(grossUnitPrice / (1 + PRODUCT_VAT_RATE)),
      quantity: String(quantity),
      totalNoVAT: formatAmount(totalNoVAT),
      totalVAT: formatAmount(grossTotal - totalNoVAT),
      unit: 'Buc',
      vat: '11%'
    };
  });
  const productsGrossTotal = roundToCents(
    productLines.reduce((total, item) => total + item.grossTotal, 0)
  );
  const globalTotal = roundToCents(Number(order.amount) || 0);
  const deliveryGrossTotal = order.shippingAddress
    ? roundToCents(Math.max(0, globalTotal - productsGrossTotal))
    : 0;
  const products = productLines.map(
    ({ grossTotal: _grossTotal, ...item }) => item
  );

  if (deliveryGrossTotal > 0) {
    const totalNoVAT = roundToCents(
      deliveryGrossTotal / (1 + DELIVERY_VAT_RATE)
    );

    products.push({
      count: products.length + 1,
      name: 'Serviciu de livrare',
      pricePerUnit: formatAmount(totalNoVAT),
      quantity: '1',
      totalNoVAT: formatAmount(totalNoVAT),
      totalVAT: formatAmount(deliveryGrossTotal - totalNoVAT),
      unit: 'Buc',
      vat: '21%'
    });
  }

  const globalNoVAT = roundToCents(
    products.reduce((total, item) => total + Number(item.totalNoVAT), 0)
  );

  return {
    billingAddress: [
      billingAddress?.addressLine1,
      billingAddress?.addressLine2,
      billingAddress?.city,
      billingAddress?.state,
      billingAddress?.postalCode,
      billingAddress?.country
    ]
      .filter(Boolean)
      .join(', '),
    clientEmail: customerEmail,
    clientName: [billingAddress?.firstName, billingAddress?.lastName]
      .filter(Boolean)
      .join(' '),
    clientPhone: billingAddress?.phone || '',
    dateOfIssue: getBucharestDate(new Date(invoice.issuedAt)),
    globalNoVAT: formatAmount(globalNoVAT),
    globalTotal: formatAmount(globalTotal),
    globalVAT: formatAmount(globalTotal - globalNoVAT),
    invoiceID: invoice.id,
    orderID: String(order.id),
    products
  };
};

const renderInvoiceDOCX = async (data: ReturnType<typeof buildInvoiceData>) => {
  const template = await readFile(path.resolve(process.cwd(), 'Factura.docx'));
  const document = new Docxtemplater(new PizZip(template), {
    linebreaks: true,
    paragraphLoop: true
  });

  document.render(data);

  return document.toBuffer();
};

const convertInvoiceToPDF = async (docx: Buffer) => {
  const require = createRequire(import.meta.url);
  const packageDirectory = path.dirname(
    require.resolve('@matbee/libreoffice-converter/package.json')
  );
  const converter = await createWorkerConverter({
    wasmPath: path.join(packageDirectory, 'wasm'),
    workerPath: path.join(packageDirectory, 'dist/node.worker.cjs')
  });

  try {
    const result = await converter.convert(
      docx,
      { outputFormat: 'pdf' },
      'Factura.docx'
    );

    return Buffer.from(result.data);
  } finally {
    await converter.destroy();
  }
};

export const generateInvoicePDF = async ({
  customerEmail,
  order,
  payload
}: {
  customerEmail: string;
  order: Order;
  payload: Payload;
}) => {
  const invoice = await getOrCreateInvoice({ order, payload });
  const data = buildInvoiceData({ customerEmail, invoice, order });
  const docx = await renderInvoiceDOCX(data);
  const pdf = await convertInvoiceToPDF(docx);

  return {
    content: pdf,
    contentType: 'application/pdf',
    filename: `Factura-${invoice.id}.pdf`
  };
};
