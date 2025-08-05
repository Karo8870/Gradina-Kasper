import api from '@/lib/api/api';
import envConfig from '../../../../env.config';
import { getSoftOneClientID } from '@/lib/api/softone/softone-auth';

export async function getSoftOneClients() {
  const response = await api.post('/', {
    service: 'sqlData',
    clientID: await getSoftOneClientID(),
    appId: envConfig.SOFTONE_APP_ID,
    SqlName: 'wsSereClienti'
  });

  return response.data;
}

export async function getSoftOneClient(siteCode: string, fiscalCode: string) {
  const response = await api.post('/', {
    service: 'SqlData',
    clientID: await getSoftOneClientID(),
    appId: envConfig.SOFTONE_APP_ID,
    SqlName: 'wsSereDateClient',
    codSite: siteCode,
    codFiscal: fiscalCode
  });

  return response.data;
}

export async function getSoftOneClientByEmail(email: string) {
  const response = await api.post('/', {
    service: 'SqlData',
    clientID: await getSoftOneClientID(),
    appId: envConfig.SOFTONE_APP_ID,
    SqlName: 'wsSereDateClientEmail',
    email: encodeURIComponent(email)
  });

  return response.data;
}

export async function getSoftOneProduct(id: string) {
  const response = await api.post('/', {
    service: 'SqlData',
    clientID: await getSoftOneClientID(),
    appId: envConfig.SOFTONE_APP_ID,
    SqlName: 'wsSereGetMtrl',
    codArticol: id
  });

  return response.data;
}

export async function getSoftOneProducts(
  startDate: string,
  startHour: string,
  endDate: string,
  endHour: string
): Promise<{
  success: boolean;
  totalcount: number;
  rows: {
    MTRL: string;
    CODS1: string;
    CODSITE: string;
    NAME: string;
    CATCONTID: string;
    CATCONTNAME: string;
    MTRUNITID: string;
    MTRUNITNAME: string;
    STOC: string;
    PRETCUTVA: string;
    PRETFTVA: string;
    VATID: string;
    VATPERCNT: string;
  }[];
}> {
  const response = await api.post('/', {
    service: 'SqlData',
    clientID: await getSoftOneClientID(),
    appId: envConfig.SOFTONE_APP_ID,
    SqlName: 'wsSereGetStoc',
    dataStart: startDate,
    oraStart: startHour,
    dataFinal: endDate,
    oraFinal: endHour
  });

  return response.data;
}

export async function getSoftOneOrders(
  startDate: string,
  startHour: string,
  endDate: string,
  endHour: string
) {
  const response = await api.post('/', {
    service: 'SqlData',
    clientID: await getSoftOneClientID(),
    appId: envConfig.SOFTONE_APP_ID,
    SqlName: 'wsSereGetOrders',
    dataStart: startDate,
    oraStart: startHour,
    dataFinal: endDate,
    oraFinal: endHour
  });

  return response.data;
}

export async function getSoftOneModifiedArticles(
  startDate: string,
  startHour: string,
  endDate: string,
  endHour: string
): Promise<{
  success: boolean;
  totalcount: number;
  rows: {
    MTRL: string;
    CODS1: string;
    CODSITE: string;
    NAME: string;
    CATCONTID: string;
    CATCONTNAME: string;
    MTRUNITID: string;
    MTRUNITNAME: string;
    STOC: string;
    PRETCUTVA: string;
    PRETFTVA: string;
    VATID: string;
    VATPERCNT: string;
  }[];
}> {
  const response = await api.post('/', {
    service: 'SqlData',
    clientID: await getSoftOneClientID(),
    appId: envConfig.SOFTONE_APP_ID,
    SqlName: 'wsSereGetArticoleModified',
    dataStart: startDate,
    oraStart: startHour,
    dataFinal: endDate,
    oraFinal: endHour
  });

  console.log(response.data);

  return response.data;
}
