import type { Invoice, Order, Product } from '@/payload-types';
import path from 'node:path';
import PDFDocument from 'pdfkit';
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
      'node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf'
    );
    const boldFont = path.resolve(
      process.cwd(),
      'node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf'
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
  const pdf = await renderInvoicePDF(data);

  return {
    content: pdf,
    contentType: 'application/pdf',
    filename: `Factura-${invoice.id}.pdf`
  };
};
