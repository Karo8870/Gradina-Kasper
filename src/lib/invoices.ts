import path from 'node:path';
import PDFDocument from 'pdfkit';
import type { PayloadRequest } from 'payload';

import { extractIncludedVAT } from '@/commerce/checkout';
import { parseCheckoutSnapshot } from '@/commerce/order-display';
import type { Invoice, Order } from '@/payload-types';

const formatCents = (value: number) => (value / 100).toFixed(2);

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

export function buildInvoiceData({
  customerEmail,
  invoice,
  order
}: {
  customerEmail: string;
  invoice: Pick<Invoice, 'id' | 'issuedAt'>;
  order: Order;
}) {
  const snapshot = parseCheckoutSnapshot(order.checkoutSnapshot);
  if (!snapshot)
    throw new Error(`Order ${order.id} has no valid checkout snapshot.`);
  if (order.currency !== 'RON')
    throw new Error(`Order ${order.id} has an unsupported currency.`);
  if (snapshot.grandTotal !== order.amount)
    throw new Error(
      `Order ${order.id} total differs from its checkout snapshot.`
    );

  const products = snapshot.lines.map((line, index) => {
    const grossTotal = line.unitPrice * line.quantity;
    const { net, vat } = extractIncludedVAT(
      grossTotal,
      snapshot.vatRates.products
    );
    return {
      count: index + 1,
      name: line.name,
      pricePerUnit: formatCents(net / line.quantity),
      quantity: String(line.quantity),
      totalNoVAT: formatCents(net),
      totalVAT: formatCents(vat),
      unit: 'Buc',
      vat: `${snapshot.vatRates.products}%`
    };
  });

  if (snapshot.deliveryFee > 0) {
    const { net, vat } = extractIncludedVAT(
      snapshot.deliveryFee,
      snapshot.vatRates.delivery
    );
    products.push({
      count: products.length + 1,
      name: 'Serviciu de livrare',
      pricePerUnit: formatCents(net),
      quantity: '1',
      totalNoVAT: formatCents(net),
      totalVAT: formatCents(vat),
      unit: 'Buc',
      vat: `${snapshot.vatRates.delivery}%`
    });
  }

  const grossTotal = snapshot.lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    snapshot.deliveryFee
  );
  if (grossTotal !== snapshot.grandTotal)
    throw new Error(
      `Order ${order.id} invoice lines do not match its paid total.`
    );
  const netTotal = products.reduce(
    (sum, line) => sum + Math.round(Number(line.totalNoVAT) * 100),
    0
  );
  const vatTotal = products.reduce(
    (sum, line) => sum + Math.round(Number(line.totalVAT) * 100),
    0
  );
  const productVAT = products
    .slice(0, snapshot.lines.length)
    .reduce((sum, line) => sum + Math.round(Number(line.totalVAT) * 100), 0);
  const deliveryVAT =
    snapshot.deliveryFee > 0
      ? extractIncludedVAT(snapshot.deliveryFee, snapshot.vatRates.delivery).vat
      : 0;
  if (
    productVAT !== snapshot.productVAT ||
    deliveryVAT !== snapshot.deliveryVAT
  ) {
    throw new Error(
      `Order ${order.id} invoice VAT differs from its checkout snapshot.`
    );
  }
  if (netTotal + vatTotal !== grossTotal)
    throw new Error(`Order ${order.id} invoice VAT does not reconcile.`);
  const billingAddress = snapshot.billingAddress;

  return {
    billingAddress: [
      billingAddress.addressLine1,
      billingAddress.addressLine2,
      billingAddress.city,
      billingAddress.state,
      billingAddress.postalCode,
      billingAddress.country
    ]
      .filter(Boolean)
      .join(', '),
    clientEmail: customerEmail,
    clientName: [billingAddress.firstName, billingAddress.lastName]
      .filter(Boolean)
      .join(' '),
    clientPhone: billingAddress.phone || '',
    dateOfIssue: getBucharestDate(new Date(invoice.issuedAt)),
    globalNoVAT: formatCents(netTotal),
    globalTotal: formatCents(grossTotal),
    globalVAT: formatCents(vatTotal),
    invoiceID: invoice.id,
    orderID: String(order.id),
    products
  };
}

type InvoiceData = ReturnType<typeof buildInvoiceData>;

const renderInvoicePDF = (data: InvoiceData) =>
  new Promise<Buffer>((resolve, reject) => {
    const document = new PDFDocument({
      bufferPages: true,
      margin: 40,
      size: 'A4'
    });
    const chunks: Buffer[] = [];
    const regularFont = path.resolve(
      process.cwd(),
      'src/fonts/invoices/Geist-Regular.ttf'
    );
    const boldFont = path.resolve(
      process.cwd(),
      'src/fonts/invoices/Geist-Bold.ttf'
    );

    document.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    document.on('end', () => resolve(Buffer.concat(chunks)));
    document.on('error', reject);
    document.registerFont('Regular', regularFont);
    document.registerFont('Bold', boldFont);

    const left = 50;
    const width = 495;
    const columns = [76, 138, 33, 52, 61, 55, 50, 30];
    const headers = [
      'Nr.\ncrt.\n(1)',
      'Denumirea produselor sau a\nserviciilor\n(2)',
      'U.M.\n(3)',
      'Cantitate\n(4)',
      'Preț RON\n(fără TVA)\n(5)',
      'Val. RON\n(fără TVA)\n(6)=(4)x(5)',
      'Val. TVA\nRON\n(7)=(8)(6)',
      'TVA\n%\n(8)'
    ];

    const drawBox = (
      x: number,
      y: number,
      boxWidth: number,
      height: number
    ) => {
      document
        .rect(x, y, boxWidth, height)
        .lineWidth(0.8)
        .strokeColor('#000000')
        .stroke();
    };

    const drawTableHeader = (y: number) => {
      document
        .rect(left, y, width, 48)
        .lineWidth(0.8)
        .fillAndStroke('#D9D9D9', '#000000');
      let x = left;

      headers.forEach((header, index) => {
        if (index > 0) {
          document
            .moveTo(x, y)
            .lineTo(x, y + 48)
            .stroke();
        }
        document
          .font('Bold')
          .fontSize(7.2)
          .fillColor('#000000')
          .text(header, x + 3, y + 7, {
            align: 'center',
            height: 38,
            width: columns[index] - 8
          });
        x += columns[index];
      });

      return y + 48;
    };

    const drawProductRow = (
      product: InvoiceData['products'][number],
      y: number,
      rowHeight: number
    ) => {
      const values = [
        String(product.count),
        product.name,
        product.unit,
        product.quantity,
        product.pricePerUnit,
        product.totalNoVAT,
        product.totalVAT,
        product.vat
      ];
      let x = left;

      values.forEach((value, index) => {
        document.rect(x, y, columns[index], rowHeight).lineWidth(0.7).stroke();
        document
          .font('Regular')
          .fontSize(7.5)
          .fillColor('#000000')
          .text(value, x + 3, y + 6, {
            align: index === 1 ? 'left' : 'center',
            width: columns[index] - 6
          });
        x += columns[index];
      });
    };

    const rowHeights = data.products.map((product) =>
      Math.max(
        23,
        document
          .font('Regular')
          .fontSize(7.5)
          .heightOfString(product.name, { width: columns[1] - 6 }) + 12
      )
    );
    const pages: { end: number; start: number }[] = [];
    let productIndex = 0;

    while (productIndex < data.products.length || pages.length === 0) {
      const start = productIndex;
      let usedHeight = 0;

      while (
        productIndex < data.products.length &&
        usedHeight + rowHeights[productIndex] <=
          (pages.length === 0 ? 170 : 330)
      ) {
        usedHeight += rowHeights[productIndex];
        productIndex += 1;
      }

      if (productIndex === start && productIndex < data.products.length) {
        productIndex += 1;
      }
      pages.push({ end: productIndex, start });
    }

    pages.forEach((page, pageIndex) => {
      if (pageIndex > 0) document.addPage();

      drawBox(left, 38, width, 49);
      document
        .font('Bold')
        .fontSize(14)
        .fillColor('#000000')
        .text('FACTURA', left, 42, { align: 'center', width });
      document
        .font('Regular')
        .fontSize(8.5)
        .text(`Serie-Număr: ${data.invoiceID}`, left + 4, 61)
        .text(`Data emitere: ${data.dateOfIssue}`, left + 4, 72);

      let y: number;
      if (pageIndex === 0) {
        drawBox(left, 93, width, 128);
        document
          .font('Regular')
          .fontSize(8.5)
          .text('Furnizor:', left + 4, 98)
          .text('CIF:', left + 4, 120)
          .text('Reg. com:', left + 4, 134)
          .text('Adresa:', left + 4, 148)
          .text('IBAN(RON)', left + 4, 170)
          .text('Banca:', left + 4, 183)
          .text('Telefon:', left + 4, 196)
          .text('Email:', left + 4, 209);
        document
          .font('Bold')
          .fontSize(9.5)
          .text('SERE KASPER SRL', left + 64, 98);
        document
          .font('Regular')
          .fontSize(8.5)
          .text('RO49786327', left + 64, 120)
          .text('J202400094083', left + 64, 134)
          .text(
            'Sat Bod, Comuna Bod, Str. GARII NR.541\nBiroul1,',
            left + 64,
            148
          )
          .text('RO38 EGNA 1010 0000 0142 8705', left + 64, 170)
          .text('VISTA BANK', left + 64, 183)
          .text('0735444023', left + 64, 196)
          .text('contact@gradinakasper.ro', left + 64, 209);

        const clientX = left + 250;
        document
          .text('Client:', clientX, 98)
          .text('#Comanda:', clientX, 120)
          .text('Adresa:', clientX, 134)
          .text('Telefon:', clientX, 174)
          .text('Email:', clientX, 188)
          .text(data.clientName || '-', clientX + 60, 98, { width: 180 })
          .text(data.orderID, clientX + 60, 120, { width: 180 })
          .text(data.billingAddress || '-', clientX + 60, 134, {
            height: 36,
            width: 180
          })
          .text(data.clientPhone || '-', clientX + 60, 174, { width: 180 })
          .text(data.clientEmail || '-', clientX + 60, 188, { width: 180 });
        y = drawTableHeader(229);
      } else {
        y = drawTableHeader(97);
      }

      for (let index = page.start; index < page.end; index += 1) {
        drawProductRow(data.products[index], y, rowHeights[index]);
        y += rowHeights[index];
      }

      const isLastPage = pageIndex === pages.length - 1;
      const observationsBottom = isLastPage ? 466 : 740;
      drawBox(left, y, width, observationsBottom - y);
      document
        .font('Regular')
        .fontSize(8)
        .text('Observații :', left + 4, y + 4);

      if (!isLastPage) return;

      const splitX = left + 297;
      document.moveTo(splitX, 466).lineTo(splitX, 562).stroke();
      document
        .font('Regular')
        .fontSize(8)
        .text('Întocmit de:  SERE KASPER SRL', left + 4, 470)
        .text('Modalitate de plată:   Link de plată', splitX + 6, 470, {
          align: 'right',
          width: width - 307
        })
        .text('Curs valutar:   1.0000', splitX + 6, 482, {
          align: 'right',
          width: width - 307
        });

      drawBox(left, 493, 297, 69);
      drawBox(splitX, 493, width - 297, 69);
      document
        .font('Bold')
        .fontSize(8.5)
        .fillColor('#000000')
        .text(
          'Factura valabilă fără\nsemnătura și ștampila\ncf. art 319(29), Legea\n227/2015 privind Codul Fiscal cu\nmodificările și completările ulterioare',
          left + 60,
          499,
          { align: 'center', oblique: true, width: 180 }
        );

      document
        .moveTo(splitX, 509)
        .lineTo(left + width, 509)
        .stroke();
      document
        .font('Bold')
        .fontSize(8.5)
        .text('Total RON', splitX + 6, 497, { width: 72 })
        .font('Regular')
        .text(data.globalNoVAT, splitX + 80, 497, {
          align: 'right',
          width: 55
        })
        .text(data.globalVAT, splitX + 139, 497, {
          align: 'right',
          width: 53
        });
      document
        .font('Bold')
        .fontSize(10)
        .text(
          `TOTAL DE PLATĂ\n(col.6+col.7)\n${data.globalTotal} RON`,
          splitX + 8,
          522,
          { align: 'right', lineGap: 1, width: width - 313 }
        );
    });

    const bufferedPages = document.bufferedPageRange();
    for (let index = 0; index < bufferedPages.count; index += 1) {
      document.switchToPage(index);
      document
        .moveTo(left, 582)
        .lineTo(left + width, 582)
        .stroke();
      document
        .font('Regular')
        .fontSize(8)
        .text(`Pagina ${index + 1} / ${bufferedPages.count}`, left, 590, {
          align: 'center',
          width
        });
    }

    document.end();
  });

export async function getOrCreateInvoice({
  order,
  req
}: {
  order: Order;
  req: PayloadRequest;
}) {
  buildInvoiceData({
    customerEmail: order.customerEmail ?? '',
    invoice: { id: 0, issuedAt: new Date().toISOString() },
    order
  });
  const existing = await req.payload.find({
    collection: 'invoices',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: { order: { equals: order.id } }
  });
  if (existing.docs[0]) return existing.docs[0];

  return req.payload.create({
    collection: 'invoices',
    data: { issuedAt: new Date().toISOString(), order: order.id },
    depth: 0,
    overrideAccess: true,
    req
  });
}

export async function generateInvoicePDF({
  customerEmail,
  order,
  req
}: {
  customerEmail: string;
  order: Order;
  req: PayloadRequest;
}) {
  const invoice = await getOrCreateInvoice({ order, req });
  const data = buildInvoiceData({ customerEmail, invoice, order });
  const pdf = await renderInvoicePDF(data);
  return {
    content: pdf,
    contentType: 'application/pdf' as const,
    filename: `Factura-${invoice.id}.pdf`
  };
}
