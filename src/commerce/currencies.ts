import type {
  CurrenciesConfig,
  Currency
} from '@payloadcms/plugin-ecommerce/types';

// Change this one object to switch the template's single store currency.
export const storeCurrency: Currency = {
  code: 'RON',
  decimals: 2,
  label: 'Romanian leu',
  symbol: 'RON'
};

export const commerceCurrencies: CurrenciesConfig = {
  defaultCurrency: storeCurrency.code,
  supportedCurrencies: [storeCurrency]
};
