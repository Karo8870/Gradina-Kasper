'use client';
import React from 'react';

type BaseProps = {
  className?: string;
  currencyCodeClassName?: string;
  as?: 'span' | 'p';
};

type PriceFixed = {
  amount: number;
  currencyCode?: string;
  highestAmount?: never;
  lowestAmount?: never;
};

type PriceRange = {
  amount?: never;
  currencyCode?: string;
  highestAmount: number;
  lowestAmount: number;
};

type Props = BaseProps & (PriceFixed | PriceRange);

const formatAmount = (amount: number) => Number(amount || 0).toFixed(2);

export const Price = ({
  amount,
  as = 'span',
  className,
  currencyCode = 'RON',
  currencyCodeClassName,
  highestAmount,
  lowestAmount
}: Props & React.ComponentProps<'p'>) => {
  const Element = as;
  const value =
    typeof amount === 'number'
      ? formatAmount(amount)
      : `${formatAmount(lowestAmount)} - ${formatAmount(highestAmount)}`;

  return (
    <Element className={className}>
      {value}{' '}
      <span className={currencyCodeClassName}>{currencyCode}</span>
    </Element>
  );
};
