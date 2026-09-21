import envConfig from '../../../env.config';

import type { OrderStatus } from '@/payload-types';

import { authEmailDocument, escapeHTML } from '../auth/shared';

const statusContent = {
  cancelled: {
    body: 'Comanda ta a fost anulată. Echipa magazinului va rambursa banii în cel mai scurt timp.',
    heading: 'Comanda a fost anulată',
    subject: 'Comanda ta a fost anulată'
  },
  completed: {
    body: 'Comanda ta a fost finalizată. Îți mulțumim!',
    heading: 'Comanda a fost finalizată',
    subject: 'Comanda ta a fost finalizată'
  },
  processing: {
    body: 'Comanda ta este în procesare și este pregătită pentru livrare sau ridicare.',
    heading: 'Comanda este în procesare',
    subject: 'Comanda ta este în procesare'
  },
  refunded: {
    body: 'Comanda ta a fost marcată drept rambursată. Timpul până la apariția banilor în cont depinde de banca emitentă.',
    heading: 'Comanda a fost rambursată',
    subject: 'Comanda ta a fost rambursată'
  }
} satisfies Record<
  NonNullable<OrderStatus>,
  { body: string; heading: string; subject: string }
>;

function orderURL(orderID: number) {
  return new URL(
    `/account/orders/${orderID}`,
    envConfig.NEXT_PUBLIC_SERVER_URL
  ).toString();
}

export function orderStatusEmailSubject({
  orderID,
  status
}: {
  orderID: number;
  status: NonNullable<OrderStatus>;
}) {
  return `${statusContent[status].subject} (#${orderID})`;
}

export function orderStatusEmailHTML({
  orderID,
  status
}: {
  orderID: number;
  status: NonNullable<OrderStatus>;
}) {
  const content = statusContent[status];

  return authEmailDocument({
    actionLabel: 'Vezi comanda',
    body: `<p>${escapeHTML(content.body)}</p><p>Numărul comenzii: <strong>#${orderID}</strong></p>`,
    heading: content.heading,
    url: orderURL(orderID)
  });
}
