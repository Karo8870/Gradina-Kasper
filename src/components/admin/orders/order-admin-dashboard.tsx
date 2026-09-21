'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock3, Download, RefreshCw } from 'lucide-react';

import { updateOrderStatus } from '@/actions/orders';
import { orderStatuses } from '@/commerce/order-activity';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import type { AdminAddress, AdminOrder } from './types';

type View = 'orders' | 'products';
type Sort = 'newest' | 'oldest' | 'totalDesc' | 'totalAsc' | 'customer';
type ExportKey =
  | 'id'
  | 'createdAt'
  | 'status'
  | 'customer'
  | 'email'
  | 'phone'
  | 'fulfillment'
  | 'fulfillmentDate'
  | 'billingAddress'
  | 'shippingAddress'
  | 'items'
  | 'paymentReference'
  | 'netopiaID'
  | 'amount';

const statusLabels: Record<string, string> = {
  cancelled: 'Cancelled',
  completed: 'Completed',
  processing: 'Processing',
  refunded: 'Refunded',
  expired: 'Expired',
  failed: 'Failed',
  pending: 'Pending',
  succeeded: 'Succeeded'
};

const exportFields: Array<{ key: ExportKey; label: string }> = [
  { key: 'id', label: 'Order ID' },
  { key: 'createdAt', label: 'Placed at' },
  { key: 'status', label: 'Status' },
  { key: 'customer', label: 'Customer' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'fulfillment', label: 'Fulfillment' },
  { key: 'fulfillmentDate', label: 'Fulfillment date' },
  { key: 'billingAddress', label: 'Billing address' },
  { key: 'shippingAddress', label: 'Shipping address' },
  { key: 'items', label: 'Products' },
  { key: 'paymentReference', label: 'Payment reference' },
  { key: 'netopiaID', label: 'NETOPIA ID' },
  { key: 'amount', label: 'Total' }
];

function money(amount: number, currency = 'RON') {
  return new Intl.NumberFormat('en-GB', {
    currency,
    minimumFractionDigits: 2,
    style: 'currency'
  }).format(amount / 100);
}

function date(value: string, withTime = false) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: withTime ? 'short' : undefined,
    timeZone: 'Europe/Bucharest'
  }).format(new Date(value));
}

function address(value: AdminAddress | null) {
  if (!value) return '—';
  return [
    `${value.firstName} ${value.lastName}`.trim(),
    value.addressLine1,
    value.addressLine2,
    `${value.postalCode} ${value.city}`.trim(),
    value.state,
    value.country
  ]
    .filter(Boolean)
    .join(', ');
}

function itemSummary(order: AdminOrder) {
  return order.items
    .map((item) => `${item.quantity} × ${item.name}`)
    .join(', ');
}

function Badge({ status }: { status: string }) {
  const color = ['completed', 'succeeded'].includes(status)
    ? 'bg-emerald-500/15 text-emerald-400'
    : status === 'cancelled'
      ? 'bg-destructive/15 text-destructive'
      : ['processing', 'pending'].includes(status)
        ? 'bg-amber-500/15 text-amber-300'
        : 'bg-muted text-muted-foreground';
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${color}`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

function OrderStatusControl({
  compact = false,
  onUpdated,
  order
}: {
  compact?: boolean;
  onUpdated: () => void;
  order: AdminOrder;
}) {
  const [nextStatus, setNextStatus] = useState(order.status);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function confirmUpdate() {
    setMessage('');
    startTransition(async () => {
      const result = await updateOrderStatus({
        orderID: order.id,
        status: nextStatus as (typeof orderStatuses)[number]
      });
      if (!result.success) {
        setMessage(result.message);
        return;
      }

      setConfirmationOpen(false);
      onUpdated();
    });
  }

  const controls = (
    <>
      <div className='flex flex-1 flex-col gap-2'>
        <Label className={compact ? 'sr-only' : undefined}>Order status</Label>
        <Select
          onValueChange={(value) => setNextStatus(String(value))}
          value={nextStatus}
        >
          <SelectTrigger className={compact ? 'w-36' : 'w-full'}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {orderStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Dialog onOpenChange={setConfirmationOpen} open={confirmationOpen}>
        <DialogTrigger
          disabled={nextStatus === order.status}
          render={<Button size={compact ? 'sm' : 'default'} />}
        >
          {compact ? 'Apply' : 'Update status'}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm status change</DialogTitle>
            <DialogDescription>
              Change order #{order.id} from {statusLabels[order.status]} to{' '}
              {statusLabels[nextStatus]}? The customer will be emailed. This
              records the change but does not issue a NETOPIA refund or adjust
              inventory.
            </DialogDescription>
          </DialogHeader>
          {message ? (
            <p className='text-destructive text-sm' role='alert'>
              {message}
            </p>
          ) : null}
          <div className='flex justify-end gap-2'>
            <DialogClose
              render={<Button disabled={isPending} variant='outline' />}
            >
              Keep current status
            </DialogClose>
            <Button disabled={isPending} onClick={confirmUpdate}>
              {isPending ? 'Updating…' : 'Confirm change'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  if (compact) {
    return <div className='flex items-center gap-2'>{controls}</div>;
  }

  return (
    <Card size='sm'>
      <CardHeader>
        <CardTitle>Update status</CardTitle>
        <CardDescription>
          Status changes are recorded and emailed to the customer.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-3 sm:flex-row sm:items-end'>
        {controls}
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <div className='flex flex-col gap-2'>
      <Label>{label}</Label>
      <Select
        onValueChange={(next) => onChange(next === 'all' ? '' : String(next))}
        value={value || 'all'}
      >
        <SelectTrigger className='w-full'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Metadata({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <dl className='grid gap-4 sm:grid-cols-2'>
      {rows.map(([label, value]) => (
        <div className='min-w-0' key={label}>
          <dt className='text-muted-foreground text-xs'>{label}</dt>
          <dd className='mt-1 font-medium break-words'>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function AddressCard({
  value,
  title
}: {
  value: AdminAddress | null;
  title: string;
}) {
  return (
    <Card size='sm'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {value ? (
          <address className='text-muted-foreground flex flex-col gap-1 not-italic'>
            <strong className='text-foreground'>
              {value.firstName} {value.lastName}
            </strong>
            <span>{value.addressLine1}</span>
            {value.addressLine2 ? <span>{value.addressLine2}</span> : null}
            <span>
              {value.postalCode} {value.city}, {value.state}
            </span>
            <span>{value.country}</span>
            <span>{value.phone}</span>
          </address>
        ) : (
          <p className='text-muted-foreground'>Not provided.</p>
        )}
      </CardContent>
    </Card>
  );
}

function OrderDetails({
  onUpdated,
  order
}: {
  onUpdated: () => void;
  order: AdminOrder;
}) {
  return (
    <div className='flex flex-col gap-4'>
      <OrderStatusControl onUpdated={onUpdated} order={order} />
      <div className='grid gap-4 lg:grid-cols-2'>
        <Card size='sm'>
          <CardHeader>
            <CardTitle>Order metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <Metadata
              rows={[
                ['Order ID', `#${order.id}`],
                ['Customer ID', order.customerID ?? '—'],
                ['Payment reference', order.paymentReference || '—'],
                ['Created', date(order.createdAt, true)],
                ['Last updated', date(order.updatedAt, true)],
                ['Fulfillment date', date(order.fulfillmentDate)]
              ]}
            />
          </CardContent>
        </Card>
        <Card size='sm'>
          <CardHeader>
            <CardTitle>Immutable totals</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            {[
              ['Product subtotal', order.productSubtotal],
              ['Delivery fee', order.deliveryFee],
              [`Product VAT (${order.vatRates.products}%)`, order.productVAT],
              [`Delivery VAT (${order.vatRates.delivery}%)`, order.deliveryVAT]
            ].map(([label, amount]) => (
              <div className='flex justify-between gap-4' key={String(label)}>
                <span className='text-muted-foreground'>{label}</span>
                <strong>{money(Number(amount), order.currency)}</strong>
              </div>
            ))}
            <Separator />
            <div className='flex justify-between text-base font-semibold'>
              <span>Grand total</span>
              <span>{money(order.grandTotal, order.currency)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card size='sm'>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent>
          {order.items.map((item, index) => (
            <div
              className='flex justify-between gap-4 border-t py-3 first:border-0 first:pt-0 last:pb-0'
              key={`${item.productID}-${index}`}
            >
              <div>
                <p className='font-medium'>{item.name}</p>
                <p className='text-muted-foreground text-sm'>
                  Product #{item.productID ?? '—'} · {item.quantity} ×{' '}
                  {money(item.unitPrice, order.currency)}
                </p>
              </div>
              <strong>{money(item.lineTotal, order.currency)}</strong>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className='grid gap-4 lg:grid-cols-2'>
        <AddressCard title='Billing address' value={order.billingAddress} />
        <AddressCard
          title={
            order.fulfillmentMethod === 'delivery'
              ? 'Shipping address'
              : 'Pickup'
          }
          value={order.shippingAddress}
        />
      </div>
      <h3 className='text-base font-semibold'>Transactions</h3>
      {order.transactions.length ? (
        order.transactions.map((transaction) => (
          <Card key={transaction.id} size='sm'>
            <CardHeader className='grid-cols-[1fr_auto]'>
              <div>
                <CardTitle>Transaction #{transaction.id}</CardTitle>
                <CardDescription>
                  {date(transaction.createdAt, true)}
                </CardDescription>
              </div>
              <Badge status={transaction.status} />
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <Metadata
                rows={[
                  ['Amount', money(transaction.amount, transaction.currency)],
                  ['Payment method', transaction.paymentMethod || '—'],
                  ['NETOPIA ID', transaction.ntpID || '—'],
                  ['Merchant order ID', transaction.merchantOrderID || '—'],
                  ['Customer ID', transaction.customerID ?? '—'],
                  ['Cart ID', transaction.cartID ?? '—'],
                  ['Customer email', transaction.customerEmail || '—'],
                  ['Last updated', date(transaction.updatedAt, true)]
                ]}
              />
              {transaction.billingAddress ? (
                <>
                  <Separator />
                  <p className='text-muted-foreground'>
                    <strong className='text-foreground'>
                      Transaction billing address:{' '}
                    </strong>
                    {address(transaction.billingAddress)}
                  </p>
                </>
              ) : null}
            </CardContent>
          </Card>
        ))
      ) : (
        <p className='text-muted-foreground'>No transactions are linked.</p>
      )}
      <Card size='sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock3 className='size-4' /> Activity history
          </CardTitle>
          <CardDescription>
            Placement, customer cancellation requests, and status changes.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          {[...order.activity].reverse().map((event, index) => (
            <div
              className='grid grid-cols-[auto_1fr] gap-3'
              key={`${event.occurredAt}-${event.type}-${index}`}
            >
              <span className='bg-primary mt-1.5 size-2 rounded-full' />
              <div>
                <div className='flex flex-wrap items-center gap-2'>
                  <p className='font-medium'>{event.description}</p>
                  <span className='text-muted-foreground text-xs capitalize'>
                    {event.source}
                  </span>
                </div>
                <p className='text-muted-foreground text-xs'>
                  {date(event.occurredAt, true)}
                  {event.fromStatus && event.toStatus
                    ? ` · ${statusLabels[event.fromStatus]} → ${statusLabels[event.toStatus]}`
                    : ''}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <details className='bg-muted/30 rounded-xl border p-4'>
        <summary className='cursor-pointer font-medium'>
          Raw checkout snapshot
        </summary>
        <pre className='bg-background mt-4 max-h-96 overflow-auto rounded-lg border p-4 text-xs whitespace-pre-wrap'>
          {JSON.stringify(order.rawSnapshot, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function escapeHTML(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function download(contents: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function OrderAdminDashboard({
  initialOrders
}: {
  initialOrders: AdminOrder[];
}) {
  const router = useRouter();
  const [view, setView] = useState<View>('orders');
  const [search, setSearch] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [fulfillmentDate, setFulfillmentDate] = useState('');
  const [sort, setSort] = useState<Sort>('newest');
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [columns, setColumns] = useState<Record<ExportKey, boolean>>(
    () =>
      Object.fromEntries(
        exportFields.map((field) => [field.key, true])
      ) as Record<ExportKey, boolean>
  );

  const dates = useMemo(
    () =>
      Array.from(
        new Set(
          initialOrders.map((order) => order.fulfillmentDate).filter(Boolean)
        )
      ).sort(),
    [initialOrders]
  );
  const orders = useMemo(() => {
    const query = search.trim().toLowerCase();
    const from = start ? new Date(`${start}T00:00:00`) : null;
    const until = end ? new Date(`${end}T23:59:59`) : null;
    return initialOrders
      .filter((order) => {
        const created = new Date(order.createdAt);
        const haystack = [
          order.id,
          order.customerName,
          order.customerEmail,
          order.paymentReference,
          itemSummary(order),
          address(order.billingAddress),
          address(order.shippingAddress),
          ...order.transactions.flatMap((transaction) => [
            transaction.id,
            transaction.ntpID,
            transaction.merchantOrderID
          ])
        ]
          .join(' ')
          .toLowerCase();
        return (
          (!status || order.status === status) &&
          (!method || order.fulfillmentMethod === method) &&
          (!fulfillmentDate || order.fulfillmentDate === fulfillmentDate) &&
          (!from || created >= from) &&
          (!until || created <= until) &&
          (!query || haystack.includes(query))
        );
      })
      .sort((a, b) => {
        const cancellationPriority =
          Number(b.status === 'cancelled') - Number(a.status === 'cancelled');
        if (cancellationPriority) return cancellationPriority;

        return sort === 'oldest'
          ? +new Date(a.createdAt) - +new Date(b.createdAt)
          : sort === 'totalAsc'
            ? a.grandTotal - b.grandTotal
            : sort === 'totalDesc'
              ? b.grandTotal - a.grandTotal
              : sort === 'customer'
                ? a.customerName.localeCompare(b.customerName)
                : +new Date(b.createdAt) - +new Date(a.createdAt);
      });
  }, [
    end,
    fulfillmentDate,
    initialOrders,
    method,
    search,
    sort,
    start,
    status
  ]);

  const products = useMemo(() => {
    const groups = new Map<
      string,
      {
        id: number | null;
        name: string;
        quantity: number;
        orders: Set<number>;
        dates: Set<string>;
      }
    >();
    orders.forEach((order) =>
      order.items.forEach((item) => {
        const key = String(item.productID ?? item.name);
        const group = groups.get(key) ?? {
          id: item.productID,
          name: item.name,
          quantity: 0,
          orders: new Set<number>(),
          dates: new Set<string>()
        };
        group.quantity += item.quantity;
        group.orders.add(order.id);
        if (order.fulfillmentDate) group.dates.add(order.fulfillmentDate);
        groups.set(key, group);
      })
    );
    return Array.from(groups.values()).sort((a, b) => b.quantity - a.quantity);
  }, [orders]);

  function reset() {
    setSearch('');
    setStart('');
    setEnd('');
    setStatus('');
    setMethod('');
    setFulfillmentDate('');
    setSort('newest');
  }

  function exportData(format: 'csv' | 'xls') {
    const rows: Record<string, unknown>[] =
      view === 'products'
        ? products.map((product) => ({
            Product: product.name,
            'Product ID': product.id ?? '',
            Quantity: product.quantity,
            Orders: Array.from(product.orders)
              .map((id) => `#${id}`)
              .join(', '),
            'Fulfillment dates': Array.from(product.dates)
              .map((value) => date(value))
              .join(', ')
          }))
        : orders.map((order) =>
            Object.fromEntries(
              exportFields
                .filter((field) => columns[field.key])
                .map((field) => [
                  field.label,
                  (
                    {
                      id: order.id,
                      createdAt: date(order.createdAt, true),
                      status: statusLabels[order.status] ?? order.status,
                      customer: order.customerName,
                      email: order.customerEmail,
                      phone: order.billingAddress?.phone ?? '',
                      fulfillment: order.fulfillmentMethod,
                      fulfillmentDate: date(order.fulfillmentDate),
                      billingAddress: address(order.billingAddress),
                      shippingAddress: address(order.shippingAddress),
                      items: itemSummary(order),
                      paymentReference: order.paymentReference,
                      netopiaID: order.transactions[0]?.ntpID ?? '',
                      amount: money(order.grandTotal, order.currency)
                    } satisfies Record<ExportKey, unknown>
                  )[field.key]
                ])
            )
          );
    if (!rows.length) return;
    const headings = Object.keys(rows[0]);
    const suffix = new Date().toISOString().slice(0, 10);
    if (format === 'csv') {
      const csv = [
        headings,
        ...rows.map((row) => headings.map((heading) => row[heading]))
      ]
        .map((row) =>
          row
            .map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`)
            .join(',')
        )
        .join('\n');
      download(
        `\uFEFF${csv}`,
        `orders-${view}-${suffix}.csv`,
        'text/csv;charset=utf-8'
      );
      return;
    }
    const html = `<html><head><meta charset="utf-8"></head><body><table><thead><tr>${headings.map((heading) => `<th>${escapeHTML(heading)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${headings.map((heading) => `<td>${escapeHTML(row[heading])}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
    download(
      html,
      `orders-${view}-${suffix}.xls`,
      'application/vnd.ms-excel;charset=utf-8'
    );
  }

  return (
    <main className='mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8'>
      <header className='flex flex-col justify-between gap-4 sm:flex-row sm:items-start'>
        <div>
          <p className='text-muted-foreground text-xs font-semibold tracking-[.18em] uppercase'>
            Ecommerce administration
          </p>
          <h1 className='mt-2 text-3xl font-semibold'>Orders</h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            View, update, inspect, and export every order.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            nativeButton={false}
            render={<Link href='/admin' />}
            variant='outline'
          >
            Payload admin
          </Button>
          <Button onClick={() => router.refresh()} variant='outline'>
            <RefreshCw data-icon='inline-start' />
            Refresh
          </Button>
        </div>
      </header>
      <section className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {[
          ['Orders', orders.length],
          [
            'Processing',
            orders.filter((order) => order.status === 'processing').length
          ],
          [
            'Revenue',
            money(orders.reduce((sum, order) => sum + order.grandTotal, 0))
          ],
          ['Products', products.length]
        ].map(([label, value]) => (
          <Card key={String(label)} size='sm'>
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardTitle className='text-2xl'>{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>
      <Card>
        <CardContent className='flex flex-col gap-5'>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-7'>
            <div className='flex flex-col gap-2 md:col-span-2'>
              <Label htmlFor='search'>Search</Label>
              <Input
                id='search'
                onChange={(event) => setSearch(event.target.value)}
                placeholder='Customer, email, product, order or transaction ID…'
                value={search}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='from'>From</Label>
              <Input
                id='from'
                onChange={(event) => setStart(event.target.value)}
                type='date'
                value={start}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='until'>Until</Label>
              <Input
                id='until'
                onChange={(event) => setEnd(event.target.value)}
                type='date'
                value={end}
              />
            </div>
            <FilterSelect
              label='Fulfillment date'
              onChange={setFulfillmentDate}
              options={[
                { label: 'All dates', value: 'all' },
                ...dates.map((value) => ({ label: date(value), value }))
              ]}
              value={fulfillmentDate}
            />
            <FilterSelect
              label='Status'
              onChange={setStatus}
              options={[
                { label: 'All statuses', value: 'all' },
                ...['processing', 'completed', 'cancelled', 'refunded'].map(
                  (value) => ({ label: statusLabels[value], value })
                )
              ]}
              value={status}
            />
            <FilterSelect
              label='Fulfillment'
              onChange={setMethod}
              options={[
                { label: 'Delivery and pickup', value: 'all' },
                { label: 'Delivery', value: 'delivery' },
                { label: 'Pickup', value: 'pickup' }
              ]}
              value={method}
            />
          </div>
          <Separator />
          <div className='flex flex-col justify-between gap-3 lg:flex-row lg:items-end'>
            <div className='flex gap-2'>
              <Button
                onClick={() => setView('orders')}
                variant={view === 'orders' ? 'default' : 'outline'}
              >
                All orders
              </Button>
              <Button
                onClick={() => setView('products')}
                variant={view === 'products' ? 'default' : 'outline'}
              >
                Product summary
              </Button>
            </div>
            <div className='flex flex-wrap items-end gap-2'>
              <FilterSelect
                label='Sort'
                onChange={(value) => setSort(value as Sort)}
                options={[
                  { label: 'Newest first', value: 'newest' },
                  { label: 'Oldest first', value: 'oldest' },
                  { label: 'Highest total', value: 'totalDesc' },
                  { label: 'Lowest total', value: 'totalAsc' },
                  { label: 'Customer A–Z', value: 'customer' }
                ]}
                value={sort}
              />
              <Button onClick={reset} variant='ghost'>
                Reset filters
              </Button>
              <Dialog>
                <DialogTrigger render={<Button variant='outline' />}>
                  <Download data-icon='inline-start' />
                  Export
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export {view}</DialogTitle>
                    <DialogDescription>
                      Export the currently filtered results.
                    </DialogDescription>
                  </DialogHeader>
                  {view === 'orders' ? (
                    <div className='grid gap-3 sm:grid-cols-2'>
                      {exportFields.map((field) => (
                        <Label
                          className='bg-muted/40 rounded-lg border p-3'
                          key={field.key}
                        >
                          <Checkbox
                            checked={columns[field.key]}
                            onCheckedChange={(checked) =>
                              setColumns((current) => ({
                                ...current,
                                [field.key]: checked
                              }))
                            }
                          />
                          {field.label}
                        </Label>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground text-sm'>
                      The product export includes quantities, order IDs, and
                      fulfillment dates.
                    </p>
                  )}
                  <div className='flex justify-end gap-2'>
                    <Button onClick={() => exportData('csv')} variant='outline'>
                      Download CSV
                    </Button>
                    <Button onClick={() => exportData('xls')}>
                      Download Excel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
      <p className='text-muted-foreground text-sm'>
        {view === 'orders'
          ? `${orders.length} orders`
          : `${products.length} products`}
      </p>
      <Card className='py-0'>
        <CardContent className='overflow-x-auto px-0'>
          {view === 'orders' ? (
            <table className='w-full min-w-[1250px] text-sm'>
              <thead>
                <tr className='bg-muted/50 text-muted-foreground border-b text-left text-xs uppercase'>
                  {[
                    'Order',
                    'Customer',
                    'Fulfillment',
                    'Products',
                    'Total',
                    'Status',
                    ''
                  ].map((heading, index) => (
                    <th
                      className='px-4 py-3 font-medium'
                      key={`${heading}-${index}`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    className={
                      order.status === 'cancelled'
                        ? 'bg-destructive/10 hover:bg-destructive/15 border-destructive/30 border-b last:border-0'
                        : 'hover:bg-muted/30 border-b last:border-0'
                    }
                    key={order.id}
                  >
                    <td className='px-4 py-4 align-top'>
                      <strong>#{order.id}</strong>
                      <p className='text-muted-foreground text-xs'>
                        {date(order.createdAt, true)}
                      </p>
                      {order.transactions[0]?.ntpID ? (
                        <p className='text-muted-foreground text-xs'>
                          NETOPIA {order.transactions[0].ntpID}
                        </p>
                      ) : null}
                    </td>
                    <td className='px-4 py-4 align-top'>
                      <strong>{order.customerName || '—'}</strong>
                      <p className='text-muted-foreground text-xs'>
                        {order.customerEmail || '—'}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        {order.billingAddress?.phone || '—'}
                      </p>
                    </td>
                    <td className='px-4 py-4 align-top'>
                      <strong className='capitalize'>
                        {order.fulfillmentMethod}
                      </strong>
                      <p className='text-muted-foreground text-xs'>
                        {date(order.fulfillmentDate)}
                      </p>
                    </td>
                    <td className='text-muted-foreground max-w-80 px-4 py-4 align-top'>
                      {itemSummary(order)}
                    </td>
                    <td className='px-4 py-4 align-top font-medium'>
                      {money(order.grandTotal, order.currency)}
                    </td>
                    <td className='px-4 py-4 align-top'>
                      <div className='flex flex-col items-start gap-2'>
                        <Badge status={order.status} />
                        <OrderStatusControl
                          compact
                          onUpdated={() => router.refresh()}
                          order={order}
                        />
                      </div>
                    </td>
                    <td className='px-4 py-4 align-top'>
                      <Button
                        onClick={() => setSelected(order)}
                        size='sm'
                        variant='outline'
                      >
                        View details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className='w-full min-w-[850px] text-sm'>
              <thead>
                <tr className='bg-muted/50 text-muted-foreground border-b text-left text-xs uppercase'>
                  {[
                    'Product',
                    'Product ID',
                    'Quantity',
                    'Order count',
                    'Orders',
                    'Fulfillment dates'
                  ].map((heading) => (
                    <th className='px-4 py-3 font-medium' key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    className='border-b last:border-0'
                    key={`${product.id}-${product.name}`}
                  >
                    <td className='px-4 py-4 font-medium'>{product.name}</td>
                    <td className='px-4 py-4'>{product.id ?? '—'}</td>
                    <td className='px-4 py-4'>{product.quantity}</td>
                    <td className='px-4 py-4'>{product.orders.size}</td>
                    <td className='px-4 py-4'>
                      {Array.from(product.orders)
                        .map((id) => `#${id}`)
                        .join(', ')}
                    </td>
                    <td className='px-4 py-4'>
                      {Array.from(product.dates)
                        .map((value) => date(value))
                        .join(', ') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <Dialog
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        open={Boolean(selected)}
      >
        <DialogContent className='sm:max-w-5xl'>
          {selected ? (
            <>
              <DialogHeader>
                <div className='flex items-center gap-3'>
                  <DialogTitle>Order #{selected.id}</DialogTitle>
                  <Badge status={selected.status} />
                </div>
                <DialogDescription>
                  {selected.customerName || selected.customerEmail} ·{' '}
                  {money(selected.grandTotal, selected.currency)}
                </DialogDescription>
              </DialogHeader>
              <OrderDetails
                onUpdated={() => {
                  setSelected(null);
                  router.refresh();
                }}
                order={selected}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}
