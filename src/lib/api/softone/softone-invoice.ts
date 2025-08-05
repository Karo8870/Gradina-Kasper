import api from '@/lib/api/api';
import envConfig from '../../../../env.config';
import { getSoftOneClientID } from '@/lib/api/softone/softone-auth';

export async function printSoftOneInvoice(orderNumber: string) {
  const response = await api.post('/js/PrintInvoice/printInvoice', {
    service: 'sqlData',
    clientID: await getSoftOneClientID(),
    ordernumber: orderNumber
  });

  return response.data;
}

export async function createSoftOneClient(client: {
  name: string;
  afm: string;
  bgbulstat: string;
  jobtypetrd: string;
  email: string;
  webpage: string;
  phone1: string;
  phone2: string;
  fax: string;
  address: string;
  city: string;
  district: string;
  district1: string;
  zip: string;
  trdcategory: string;
  cmpmode: string;
  vatsts: string;
  efactura: string;
  num01: string;
}) {
  const response = await api.post('/', {
    service: 'setData',
    clientID: await getSoftOneClientID(),
    appId: envConfig.SOFTONE_APP_ID,
    OBJECT: 'CUSTOMER',
    data: {
      CUSTOMER: [
        {
          NAME: client.name, // Nume client
          AFM: client.afm, // Cod fiscal
          BGBULSTAT: client.bgbulstat, // Se completeaza cu ‚RO’ daca clientul are acest indicativ in codul fiscal
          JOBTYPETRD: client.jobtypetrd, // Nr. Reg. Com.
          EMAIL: client.email,
          WEBPACE: client.webpage,
          PHONE01: client.phone1,
          PHONE02: client.phone2,
          FAX: client.fax,
          ADDRESS: client.address, // ADDRESS	Varchar(100)	Adresa – obligatoriu
          CITY: client.city, // Oras – obligatoriu
          DISTRICT: client.district, // Sector – obligatoriu pentru clientii din Bucuresti. Informatia se trimite de forma „SECTOR1”, „SECTOR2”, etc
          DISTRICT1: client.district1, // Judet – obligatoriu – mapare lista
          ZIP: client.zip, // Cod postal
          TRDCATEGORY: client.trdcategory, // Categorie contabila – mapare lista
          CMPMODE: client.cmpmode, // Forma legala companie 11 – Persoana 501 – Companie locala 502 – Companie externa
          VATSTS: client.vatsts // Status TVA 0 – Scutit 1 – Normal 2 – TVA la incasare
        }
      ],
      CUSEXTRA: [
        {
          EFACTURA: client.efactura, // Inregistrat in E-Factura – obligatoriu 0 – Nu 1 – Companie Inregistrata in sistem 2 – Institutie publica
          NUM01: client.num01 // Cod client site
        }
      ]
    }
  });

  return response.data;
}

export async function createSoftOneOrder(
  items: {
    id: string;
    quantity: number;
    price: number;
  }[],
  order: {
    shippingAddress: string;
    shippingAddressZip: string;
    shippingDistrict: string;
    shippingCity: string;
    orderDate: string;
    comments: string;
    orderID: string;
  }
) {
  const response = await api.post('/', {
    service: 'setData',
    clientID: await getSoftOneClientID(),
    appId: envConfig.SOFTONE_APP_ID,
    OBJECT: 'SALDOC',
    data: {
      SALDOC: [
        {
          SERIES: '7021', // ???
          TRDR: '6335',
          TRNDATE: order.orderDate,
          BRANCH: '2000',
          COMMENTS: order.comments,
          INT01: order.orderID
        }
      ],
      MTRDOC: [
        {
          WHOUSE: '1000',
          SHIPPINGADDR: order.shippingAddress,
          SHPZIP: order.shippingAddressZip,
          SHPDISTRICT: order.shippingDistrict,
          SHPCITY: order.shippingCity
        }
      ],
      ITELINES: items.map((item) => ({
        MTRL: item.id,
        QTY1: item.quantity,
        PRICE: item.price
      })),
      SRVLINES: []
    }
  });

  return response.data;
}
