import {
  ArrowLeft,
  Clock3,
  CreditCard,
  MapPin,
  PackageCheck
} from 'lucide-react';
import Link from 'next/link';

import {
  formatOrderDate,
  formatOrderMoney,
  orderStatusLabels,
  parseCheckoutSnapshot,
  transactionStatusLabels,
  type CheckoutSnapshot
} from '@/commerce/order-display';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Order, Transaction } from '@/payload-types';

function AddressDetails({
  address,
  title
}: {
  address: CheckoutSnapshot['billingAddress'];
  title: string;
}) {
  return (
    <div>
      <p className='font-medium'>{title}</p>
      <address className='text-muted-foreground mt-2 text-sm not-italic'>
        <span className='block'>
          {address.firstName} {address.lastName}
        </span>
        <span className='block'>{address.addressLine1}</span>
        {address.addressLine2 ? (
          <span className='block'>{address.addressLine2}</span>
        ) : null}
        <span className='block'>
          {address.postalCode} {address.city}, {address.state},{' '}
          {address.country}
        </span>
        <span className='block'>{address.phone}</span>
      </address>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between gap-4 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-medium'>{value}</span>
    </div>
  );
}

export function AccountOrderDetail({
  order,
  transactions
}: {
  order: Order;
  transactions: Transaction[];
}) {
  const snapshot = parseCheckoutSnapshot(order.checkoutSnapshot);
  const activity = order.activity?.length
    ? order.activity
    : [
        {
          occurredAt: order.createdAt,
          source: 'system' as const,
          toStatus: 'processing' as const,
          type: 'order_placed' as const
        }
      ];

  return (
    <div className='flex max-w-3xl flex-col gap-6'>
      <div>
        <Button
          nativeButton={false}
          render={<Link href='/account/orders' />}
          variant='ghost'
        >
          <ArrowLeft data-icon='inline-start' />
          Înapoi la comenzi
        </Button>
      </div>

      <header className='flex flex-col gap-2'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <h1 className='text-2xl font-semibold'>Comanda #{order.id}</h1>
          <span className='text-sm font-medium'>
            {orderStatusLabels[order.status ?? 'processing']}
          </span>
        </div>
        <p className='text-muted-foreground text-sm'>
          Plasată la {formatOrderDate(order.createdAt)}
        </p>
        {/* Customer order cancellation is disabled.
        {canCancelOrder(order) ? (
          <div className='mt-2'>
            <CancelOrderButton orderID={order.id} />
          </div>
        ) : null} */}
      </header>

      {snapshot ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <PackageCheck className='size-5' /> Produse
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              {snapshot.lines.map((line) => (
                <div
                  className='flex items-start justify-between gap-4'
                  key={`${line.product}-${line.name}`}
                >
                  <div>
                    <p className='font-medium'>{line.name}</p>
                    <p className='text-muted-foreground text-sm'>
                      {line.quantity} × {formatOrderMoney(line.unitPrice)}
                    </p>
                  </div>
                  <p className='font-medium'>
                    {formatOrderMoney(line.unitPrice * line.quantity)}
                  </p>
                </div>
              ))}
              <Separator />
              <SummaryRow
                label='Subtotal produse'
                value={formatOrderMoney(snapshot.productSubtotal)}
              />
              <SummaryRow
                label={
                  snapshot.fulfillmentMethod === 'delivery'
                    ? 'Taxă de livrare'
                    : 'Ridicare personală'
                }
                value={formatOrderMoney(snapshot.deliveryFee)}
              />
              <SummaryRow
                label={`TVA produse (${snapshot.vatRates.products}%)`}
                value={formatOrderMoney(snapshot.productVAT)}
              />
              {snapshot.deliveryFee ? (
                <SummaryRow
                  label={`TVA livrare (${snapshot.vatRates.delivery}%)`}
                  value={formatOrderMoney(snapshot.deliveryVAT)}
                />
              ) : null}
              <Separator />
              <div className='flex items-center justify-between gap-4 text-lg font-semibold'>
                <span>Total</span>
                <span>{formatOrderMoney(snapshot.grandTotal)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MapPin className='size-5' /> Livrare și facturare
              </CardTitle>
              <CardDescription>
                {snapshot.fulfillmentMethod === 'delivery'
                  ? `Data livrării: ${formatOrderDate(snapshot.fulfillmentDate)}`
                  : `Data ridicării: ${formatOrderDate(snapshot.fulfillmentDate)}`}
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-6 sm:grid-cols-2'>
              <AddressDetails
                address={snapshot.billingAddress}
                title='Adresă de facturare'
              />
              {snapshot.shippingAddress ? (
                <AddressDetails
                  address={snapshot.shippingAddress}
                  title='Adresă de livrare'
                />
              ) : (
                <div>
                  <p className='font-medium'>Ridicare personală</p>
                  <p className='text-muted-foreground mt-2 text-sm'>
                    Comanda nu necesită o adresă de livrare.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CreditCard className='size-5' /> Tranzacții
          </CardTitle>
          <CardDescription>Plățile asociate acestei comenzi.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          {transactions.length ? (
            transactions.map((transaction) => (
              <div className='rounded-lg border p-4' key={transaction.id}>
                <div className='flex items-center justify-between gap-4'>
                  <p className='font-medium'>Tranzacția #{transaction.id}</p>
                  <p className='font-semibold'>
                    {formatOrderMoney(transaction.amount)}
                  </p>
                </div>
                <div className='text-muted-foreground mt-2 grid gap-1 text-sm sm:grid-cols-2'>
                  <span>
                    Stare: {transactionStatusLabels[transaction.status]}
                  </span>
                  <span>Metodă: NETOPIA Payments</span>
                  <span>{formatOrderDate(transaction.createdAt)}</span>
                  {transaction.netopia?.ntpID ? (
                    <span>Referință NETOPIA: {transaction.netopia.ntpID}</span>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className='text-muted-foreground text-sm'>
              Nu există tranzacții asociate.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock3 className='size-5' /> Istoricul comenzii
          </CardTitle>
          <CardDescription>
            Evenimentele și schimbările de stare ale comenzii.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          {activity.map((event, index) => (
            <div
              className='grid grid-cols-[auto_1fr] gap-3'
              key={`${event.occurredAt}-${event.type}-${index}`}
            >
              <span className='bg-primary mt-1.5 size-2 rounded-full' />
              <div>
                <p className='font-medium'>
                  {event.type === 'order_placed'
                    ? 'Comandă plasată'
                    : event.type === 'cancellation_requested'
                      ? 'Anulare solicitată'
                      : `Stare schimbată în ${
                          event.toStatus
                            ? orderStatusLabels[event.toStatus]
                            : '—'
                        }`}
                </p>
                <p className='text-muted-foreground text-sm'>
                  {formatOrderDate(event.occurredAt)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
