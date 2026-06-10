'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type OrderItemRow = {
  productId: number | null;
  productName: string;
  quantity: number;
};

type OrderRow = {
  id: number;
  createdAt: string;
  status: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  billingAddress: string;
  shippingAddress: string;
  fulfillmentMethod: 'delivery' | 'pickup';
  shouldBeDeliveredOn: string | null;
  items: OrderItemRow[];
  itemsLabel: string;
  amount: number | null;
  currency: string;
};

type ProductGroupRow = {
  productId: number | null;
  productName: string;
  totalQuantity: number;
  orderCount: number;
  orders: string;
  deliveryDates: string;
};

type DeliveryDateOption = {
  value: string;
  label: string;
};

type OrdersResponse = {
  docs: OrderRow[];
  deliveryDates: DeliveryDateOption[];
};

type TabType = 'orders' | 'products';
type SortKey =
  | 'createdAtDesc'
  | 'createdAtAsc'
  | 'deliveryDateDesc'
  | 'deliveryDateAsc'
  | 'amountDesc'
  | 'amountAsc'
  | 'customerAsc';

type ExportFieldKey =
  | 'id'
  | 'createdAt'
  | 'status'
  | 'customerName'
  | 'customerEmail'
  | 'phone'
  | 'billingAddress'
  | 'shippingAddress'
  | 'fulfillmentMethod'
  | 'shouldBeDeliveredOn'
  | 'itemsLabel'
  | 'amount';

const STATUS_OPTIONS = [
  { value: '', label: 'Toate statusurile' },
  { value: 'processing', label: 'Comandă primită' },
  { value: 'completed', label: 'Livrat / Ridicat' },
  { value: 'cancelled', label: 'Anulat' },
  { value: 'refunded', label: 'Rambursat' }
];

const ORDER_STATUS_OPTIONS = STATUS_OPTIONS.filter((option) => option.value);

const FULFILLMENT_OPTIONS = [
  { value: '', label: 'Livrare și ridicare' },
  { value: 'delivery', label: 'Livrare' },
  { value: 'pickup', label: 'Ridicare' }
];

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'createdAtDesc', label: 'Cele mai recente' },
  { value: 'createdAtAsc', label: 'Cele mai vechi' },
  { value: 'deliveryDateDesc', label: 'Livrare descrescător' },
  { value: 'deliveryDateAsc', label: 'Livrare crescător' },
  { value: 'amountDesc', label: 'Total descrescător' },
  { value: 'amountAsc', label: 'Total crescător' },
  { value: 'customerAsc', label: 'Client A-Z' }
];

const EXPORT_FIELDS: Array<{ key: ExportFieldKey; label: string }> = [
  { key: 'id', label: 'ID comandă' },
  { key: 'createdAt', label: 'Ora comenzii' },
  { key: 'status', label: 'Status' },
  { key: 'customerName', label: 'Client' },
  { key: 'customerEmail', label: 'Email' },
  { key: 'phone', label: 'Telefon' },
  { key: 'billingAddress', label: 'Adresă facturare' },
  { key: 'shippingAddress', label: 'Adresă livrare' },
  { key: 'fulfillmentMethod', label: 'Livrare / ridicare' },
  { key: 'shouldBeDeliveredOn', label: 'Data livrării' },
  { key: 'itemsLabel', label: 'Produse' },
  { key: 'amount', label: 'Total' }
];

const PRODUCT_EXPORT_FIELDS: Array<{
  key: keyof ProductGroupRow;
  label: string;
}> = [
  { key: 'productName', label: 'Produs' },
  { key: 'totalQuantity', label: 'Cantitate totală' },
  { key: 'orderCount', label: 'Număr comenzi' },
  { key: 'orders', label: 'Comenzi' },
  { key: 'deliveryDates', label: 'Date livrare' }
];

const formatDate = (value?: string | null) => {
  if (!value) return '-';

  return new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(value));
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';

  return new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

const formatMoney = (amount: number | null, currency = 'RON') => {
  if (typeof amount !== 'number') return '-';

  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const getDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

const escapeHTML = (value: unknown) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

export const OrdersAdminPanel = () => {
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [deliveryDates, setDeliveryDates] = useState<DeliveryDateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [fulfillmentMethod, setFulfillmentMethod] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('createdAtDesc');
  const [selectedOrderIDs, setSelectedOrderIDs] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState('completed');
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFields, setExportFields] = useState<
    Record<ExportFieldKey, boolean>
  >(() =>
    EXPORT_FIELDS.reduce(
      (fields, field) => ({ ...fields, [field.key]: true }),
      {} as Record<ExportFieldKey, boolean>
    )
  );

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders');

      if (!response.ok) {
        throw new Error('Nu am putut încărca comenzile.');
      }

      const data = (await response.json()) as OrdersResponse;
      setRows(data.docs || []);
      setDeliveryDates(data.deliveryDates || []);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: number, nextStatus: string) => {
    const previousRows = rows;

    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id ? { ...row, status: nextStatus } : row
      )
    );

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status: nextStatus })
      });

      if (!response.ok) {
        throw new Error('Nu am putut actualiza statusul comenzii.');
      }

      toast.success('Statusul comenzii a fost actualizat.');
    } catch (error) {
      setRows(previousRows);
      toast.error((error as Error).message);
    }
  };

  const updateBulkStatus = async () => {
    if (!selectedOrderIDs.length) {
      toast.error('Selectează cel puțin o comandă.');
      return;
    }

    const previousRows = rows;

    setRows((currentRows) =>
      currentRows.map((row) =>
        selectedOrderIDs.includes(row.id) ? { ...row, status: bulkStatus } : row
      )
    );

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: selectedOrderIDs, status: bulkStatus })
      });

      if (!response.ok) {
        throw new Error('Nu am putut actualiza comenzile selectate.');
      }

      toast.success('Statusul comenzilor selectate a fost actualizat.');
      setSelectedOrderIDs([]);
    } catch (error) {
      setRows(previousRows);
      toast.error((error as Error).message);
    }
  };

  const filteredRows = useMemo(() => {
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;
    const normalizedSearch = search.trim().toLowerCase();

    return rows.filter((row) => {
      const createdAt = new Date(row.createdAt);
      const searchContent = [
        row.id,
        row.createdAt,
        formatDateTime(row.createdAt),
        row.status,
        row.customerName,
        row.customerEmail,
        row.phone,
        row.billingAddress,
        row.shippingAddress,
        row.fulfillmentMethod === 'delivery' ? 'livrare' : 'ridicare',
        row.shouldBeDeliveredOn,
        formatDate(row.shouldBeDeliveredOn),
        row.itemsLabel,
        row.amount,
        row.currency
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        (!status || row.status === status) &&
        (!fulfillmentMethod || row.fulfillmentMethod === fulfillmentMethod) &&
        (!deliveryDate || row.shouldBeDeliveredOn === deliveryDate) &&
        (!start || createdAt >= start) &&
        (!end || createdAt <= end) &&
        (!normalizedSearch || searchContent.includes(normalizedSearch))
      );
    });
  }, [
    deliveryDate,
    endDate,
    fulfillmentMethod,
    rows,
    search,
    startDate,
    status
  ]);

  const displayedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      if (sort === 'createdAtAsc') {
        return +new Date(a.createdAt) - +new Date(b.createdAt);
      }

      if (sort === 'deliveryDateDesc' || sort === 'deliveryDateAsc') {
        const first = a.shouldBeDeliveredOn
          ? +new Date(a.shouldBeDeliveredOn)
          : 0;
        const second = b.shouldBeDeliveredOn
          ? +new Date(b.shouldBeDeliveredOn)
          : 0;

        return sort === 'deliveryDateAsc' ? first - second : second - first;
      }

      if (sort === 'amountDesc' || sort === 'amountAsc') {
        const first = a.amount ?? 0;
        const second = b.amount ?? 0;

        return sort === 'amountAsc' ? first - second : second - first;
      }

      if (sort === 'customerAsc') {
        return a.customerName.localeCompare(b.customerName, 'ro');
      }

      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
  }, [filteredRows, sort]);

  const visibleOrderIDs = useMemo(
    () => displayedRows.map((order) => order.id),
    [displayedRows]
  );
  const allVisibleSelected =
    visibleOrderIDs.length > 0 &&
    visibleOrderIDs.every((id) => selectedOrderIDs.includes(id));

  const toggleSelectedOrder = (id: number) => {
    setSelectedOrderIDs((current) =>
      current.includes(id)
        ? current.filter((selectedID) => selectedID !== id)
        : [...current, id]
    );
  };

  const toggleAllVisibleOrders = () => {
    setSelectedOrderIDs((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleOrderIDs.includes(id));
      }

      return Array.from(new Set([...current, ...visibleOrderIDs]));
    });
  };

  const productRows = useMemo(() => {
    const grouped = new Map<
      string,
      ProductGroupRow & { dateSet: Set<string> }
    >();

    displayedRows.forEach((order) => {
      order.items.forEach((item) => {
        const key = String(item.productId ?? item.productName);
        const current =
          grouped.get(key) ||
          ({
            productId: item.productId,
            productName: item.productName,
            totalQuantity: 0,
            orderCount: 0,
            orders: '',
            deliveryDates: '',
            dateSet: new Set<string>()
          } satisfies ProductGroupRow & { dateSet: Set<string> });

        current.totalQuantity += item.quantity;
        current.orderCount += 1;
        current.orders = current.orders
          ? `${current.orders}, #${order.id}`
          : `#${order.id}`;

        if (order.shouldBeDeliveredOn) {
          current.dateSet.add(formatDate(order.shouldBeDeliveredOn));
        }

        grouped.set(key, current);
      });
    });

    return Array.from(grouped.values())
      .map(({ dateSet, ...row }) => ({
        ...row,
        deliveryDates: Array.from(dateSet).join(', ') || '-'
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [displayedRows]);

  const exportRows = () => {
    if (activeTab === 'products') {
      return productRows.map((row) =>
        PRODUCT_EXPORT_FIELDS.reduce(
          (output, field) => ({
            ...output,
            [field.label]: row[field.key]
          }),
          {} as Record<string, unknown>
        )
      );
    }

    const enabledFields = EXPORT_FIELDS.filter(
      (field) => exportFields[field.key]
    );

    return displayedRows.map((row) =>
      enabledFields.reduce(
        (output, field) => {
          const value = row[field.key];

          if (field.key === 'createdAt') {
            return {
              ...output,
              [field.label]: formatDateTime(value as string)
            };
          }

          if (field.key === 'shouldBeDeliveredOn') {
            return { ...output, [field.label]: formatDate(value as string) };
          }

          if (field.key === 'amount') {
            return {
              ...output,
              [field.label]: formatMoney(row.amount, row.currency)
            };
          }

          if (field.key === 'fulfillmentMethod') {
            return {
              ...output,
              [field.label]: value === 'delivery' ? 'Livrare' : 'Ridicare'
            };
          }

          return { ...output, [field.label]: value };
        },
        {} as Record<string, unknown>
      )
    );
  };

  const exportExcel = () => {
    if (
      activeTab === 'orders' &&
      !EXPORT_FIELDS.some((field) => exportFields[field.key])
    ) {
      toast.error('Selectează cel puțin o coloană.');
      return;
    }

    const data = exportRows();

    if (!data.length) {
      toast.error('Nu există comenzi de exportat.');
      return;
    }

    const columns = Object.keys(data[0]);
    const html = `
      <html>
        <head><meta charset="utf-8" /></head>
        <body>
          <table>
            <thead>
              <tr>${columns.map((column) => `<th>${escapeHTML(column)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (row) =>
                    `<tr>${columns
                      .map((column) => `<td>${escapeHTML(row[column])}</td>`)
                      .join('')}</tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const blob = new Blob([html], {
      type: 'application/vnd.ms-excel;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `comenzi-${activeTab}-${getDateInputValue(new Date())}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
    toast.success('Exportul a fost generat.');
  };

  const resetFilters = () => {
    setStatus('');
    setFulfillmentMethod('');
    setDeliveryDate('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setSort('createdAtDesc');
    setSelectedOrderIDs([]);
  };

  return (
    <div className='space-y-6'>
      <div className='border-primary-100 rounded-[2rem] border bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <p className='text-primary-700 text-xs font-semibold tracking-[0.2em] uppercase'>
              Gestionare
            </p>
            <h2 className='text-primary-900 mt-1 text-2xl font-bold'>
              Comenzi și produse
            </h2>
            <p className='mt-1 text-sm text-neutral-600'>
              Filtrează comenzile, vezi totalurile pe produse și exportă exact
              coloanele de care ai nevoie.
            </p>
          </div>

          <div className='bg-secondary-50 border-primary-100 flex items-center gap-2 rounded-full border p-1'>
            <button
              onClick={() => setActiveTab('orders')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'orders'
                  ? 'bg-primary-900 text-white shadow-sm'
                  : 'text-primary-800 hover:bg-white'
              }`}
            >
              Toate comenzile
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'products'
                  ? 'bg-primary-900 text-white shadow-sm'
                  : 'text-primary-800 hover:bg-white'
              }`}
            >
              Produse
            </button>
          </div>
        </div>
      </div>

      <div className='border-primary-100 space-y-4 rounded-[2rem] border bg-white p-5 shadow-sm'>
        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-6'>
          <label className='space-y-2 md:col-span-2 xl:col-span-2'>
            <span className='text-xs font-semibold tracking-wide text-neutral-500 uppercase'>
              Căutare
            </span>
            <input
              type='search'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Caută după client, email, telefon, produs, status...'
              className='border-primary-100 text-primary-900 h-11 w-full rounded-2xl border bg-white px-3 text-sm outline-none placeholder:text-neutral-400 focus:border-primary-900'
            />
          </label>

          <label className='space-y-2'>
            <span className='text-xs font-semibold tracking-wide text-neutral-500 uppercase'>
              De la
            </span>
            <input
              type='date'
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className='border-primary-100 text-primary-900 h-11 w-full rounded-2xl border bg-white px-3 text-sm outline-none focus:border-primary-900'
            />
          </label>

          <label className='space-y-2'>
            <span className='text-xs font-semibold tracking-wide text-neutral-500 uppercase'>
              Până la
            </span>
            <input
              type='date'
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className='border-primary-100 text-primary-900 h-11 w-full rounded-2xl border bg-white px-3 text-sm outline-none focus:border-primary-900'
            />
          </label>

          <label className='space-y-2'>
            <span className='text-xs font-semibold tracking-wide text-neutral-500 uppercase'>
              Data livrării
            </span>
            <select
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
              className='border-primary-100 text-primary-900 h-11 w-full rounded-2xl border bg-white px-3 text-sm outline-none focus:border-primary-900'
            >
              <option value=''>Toate datele</option>
              {deliveryDates.map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
          </label>

          <label className='space-y-2'>
            <span className='text-xs font-semibold tracking-wide text-neutral-500 uppercase'>
              Status
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className='border-primary-100 text-primary-900 h-11 w-full rounded-2xl border bg-white px-3 text-sm outline-none focus:border-primary-900'
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className='space-y-2'>
            <span className='text-xs font-semibold tracking-wide text-neutral-500 uppercase'>
              Livrare / ridicare
            </span>
            <select
              value={fulfillmentMethod}
              onChange={(event) => setFulfillmentMethod(event.target.value)}
              className='border-primary-100 text-primary-900 h-11 w-full rounded-2xl border bg-white px-3 text-sm outline-none focus:border-primary-900'
            >
              {FULFILLMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className='space-y-2'>
            <span className='text-xs font-semibold tracking-wide text-neutral-500 uppercase'>
              Sortare
            </span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className='border-primary-100 text-primary-900 h-11 w-full rounded-2xl border bg-white px-3 text-sm outline-none focus:border-primary-900'
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-3'>
          <p className='text-sm text-neutral-600'>
            {loading
              ? 'Se încarcă...'
              : `${displayedRows.length} comenzi filtrate`}
          </p>

          <div className='flex flex-wrap gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={resetFilters}
              className='h-11 rounded-full border-neutral-200 bg-white px-5 text-primary-900'
            >
              Resetează
            </Button>
            <Button
              type='button'
              onClick={fetchOrders}
              disabled={loading}
              className='h-11 rounded-full bg-primary-900 px-5 text-white hover:bg-primary-800'
            >
              Reîncarcă
            </Button>
            <Dialog open={exportOpen} onOpenChange={setExportOpen}>
              <DialogTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  disabled={loading}
                  className='h-11 rounded-full border-neutral-200 bg-white px-5 text-primary-900'
                >
                  Export Excel
                </Button>
              </DialogTrigger>
              <DialogContent className='border-primary-100 rounded-[1.75rem] border bg-white'>
                <DialogHeader>
                  <DialogTitle className='text-primary-900 text-2xl font-bold'>
                    Export Excel
                  </DialogTitle>
                  <DialogDescription>
                    Alege coloanele exportate pentru tabul de comenzi. Tabul de
                    produse exportă sumarul pe produse.
                  </DialogDescription>
                </DialogHeader>

                {activeTab === 'orders' ? (
                  <div className='grid gap-3 sm:grid-cols-2'>
                    {EXPORT_FIELDS.map((field) => (
                      <label
                        key={field.key}
                        className='flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3'
                      >
                        <input
                          type='checkbox'
                          checked={exportFields[field.key]}
                          onChange={(event) =>
                            setExportFields((current) => ({
                              ...current,
                              [field.key]: event.target.checked
                            }))
                          }
                          className='accent-primary-900 size-4'
                        />
                        <span className='text-primary-900 text-sm font-medium'>
                          {field.label}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className='rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600'>
                    Exportul va include produsul, cantitatea totală, numărul de
                    comenzi, comenzile și datele de livrare.
                  </p>
                )}

                <DialogFooter>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setExportOpen(false)}
                    className='h-11 rounded-full border-neutral-200 bg-white px-5 text-primary-900'
                  >
                    Renunță
                  </Button>
                  <Button
                    type='button'
                    onClick={exportExcel}
                    className='h-11 rounded-full bg-primary-900 px-5 text-white hover:bg-primary-800'
                  >
                    Descarcă
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {activeTab === 'orders' && (
          <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3'>
            <div className='flex flex-wrap items-center gap-3'>
              <label className='flex items-center gap-2 text-sm font-semibold text-primary-900'>
                <input
                  type='checkbox'
                  checked={allVisibleSelected}
                  onChange={toggleAllVisibleOrders}
                  className='accent-primary-900 size-4'
                />
                Selectează toate comenzile vizibile
              </label>
              <span className='text-sm text-neutral-600'>
                {selectedOrderIDs.length} selectate
              </span>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <select
                value={bulkStatus}
                onChange={(event) => setBulkStatus(event.target.value)}
                className='border-primary-100 text-primary-900 h-10 rounded-2xl border bg-white px-3 text-sm font-semibold outline-none focus:border-primary-900'
              >
                {ORDER_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button
                type='button'
                onClick={updateBulkStatus}
                disabled={!selectedOrderIDs.length}
                className='h-10 rounded-full bg-primary-900 px-5 text-white hover:bg-primary-800'
              >
                Schimbă statusul
              </Button>
            </div>
          </div>
        )}
      </div>

      {activeTab === 'orders' ? (
        <div className='border-primary-100 overflow-hidden rounded-[1.5rem] border bg-white shadow-sm'>
          <div className='overflow-auto'>
            <table className='min-w-full table-auto'>
              <thead>
                <tr className='bg-primary-900 text-left text-white'>
                  <th className='px-4 py-3 text-xs font-semibold tracking-wide uppercase'>
                    <input
                      type='checkbox'
                      checked={allVisibleSelected}
                      onChange={toggleAllVisibleOrders}
                      className='accent-primary-900 size-4'
                      aria-label='Selectează toate comenzile vizibile'
                    />
                  </th>
                  <th className='px-4 py-3 text-xs font-semibold tracking-wide uppercase'>
                    Comandă
                  </th>
                  <th className='px-4 py-3 text-xs font-semibold tracking-wide uppercase'>
                    Client
                  </th>
                  <th className='px-4 py-3 text-xs font-semibold tracking-wide uppercase'>
                    Livrare / ridicare
                  </th>
                  <th className='px-4 py-3 text-xs font-semibold tracking-wide uppercase'>
                    Date comandă
                  </th>
                  <th className='px-4 py-3 text-xs font-semibold tracking-wide uppercase'>
                    Adrese
                  </th>
                  <th className='px-4 py-3 text-xs font-semibold tracking-wide uppercase'>
                    Produse
                  </th>
                  <th className='px-4 py-3 text-xs font-semibold tracking-wide uppercase'>
                    Total
                  </th>
                  <th className='px-4 py-3 text-xs font-semibold tracking-wide uppercase'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-neutral-200'>
                {displayedRows.map((order) => (
                  <tr key={order.id} className='hover:bg-primary-50/60'>
                    <td className='px-4 py-4 align-top'>
                      <input
                        type='checkbox'
                        checked={selectedOrderIDs.includes(order.id)}
                        onChange={() => toggleSelectedOrder(order.id)}
                        className='accent-primary-900 size-4'
                        aria-label={`Selectează comanda ${order.id}`}
                      />
                    </td>
                    <td className='px-4 py-4 align-top'>
                      <p className='text-primary-900 text-sm font-semibold'>
                        #{order.id}
                      </p>
                      <p className='text-xs text-neutral-500'>
                        {formatDateTime(order.createdAt)}
                      </p>
                    </td>
                    <td className='px-4 py-4 align-top'>
                      <p className='text-primary-900 text-sm font-semibold'>
                        {order.customerName || '-'}
                      </p>
                      <p className='text-sm text-neutral-700'>
                        {order.customerEmail || '-'}
                      </p>
                      <p className='text-xs text-neutral-500'>
                        {order.phone || 'Fără telefon'}
                      </p>
                    </td>
                    <td className='px-4 py-4 align-top'>
                      <p className='text-primary-900 text-sm font-semibold'>
                        {order.fulfillmentMethod === 'delivery'
                          ? 'Livrare'
                          : 'Ridicare'}
                      </p>
                    </td>
                    <td className='px-4 py-4 align-top'>
                      <p className='text-sm text-neutral-700'>
                        {formatDate(order.shouldBeDeliveredOn)}
                      </p>
                    </td>
                    <td className='px-4 py-4 align-top'>
                      <div className='max-w-96 space-y-2 text-xs leading-relaxed text-neutral-600'>
                        <div>
                          <p className='text-primary-900 font-semibold'>
                            Facturare
                          </p>
                          <p>{order.billingAddress || '-'}</p>
                        </div>
                        <div>
                          <p className='text-primary-900 font-semibold'>
                            Livrare
                          </p>
                          <p>{order.shippingAddress || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-4 align-top text-sm text-neutral-700'>
                      <div className='max-w-[28rem]'>{order.itemsLabel}</div>
                    </td>
                    <td className='text-primary-900 px-4 py-4 align-top text-sm font-semibold'>
                      {formatMoney(order.amount, order.currency)}
                    </td>
                    <td className='px-4 py-4 align-top'>
                      <div className='border-primary-100 bg-primary-50 max-w-[12rem] rounded-2xl border px-3 py-2'>
                        <select
                          value={order.status}
                          onChange={(event) =>
                            updateStatus(order.id, event.target.value)
                          }
                          className='text-primary-900 w-full bg-transparent text-sm font-semibold outline-none'
                        >
                          {ORDER_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className='border-primary-100 overflow-hidden rounded-[1.5rem] border bg-white shadow-sm'>
          <div className='overflow-auto'>
            <table className='min-w-full table-auto'>
              <thead>
                <tr className='bg-primary-900 text-left text-white'>
                  <th className='px-4 py-3 text-xs font-semibold tracking-wide uppercase'>
                    Produs
                  </th>
                  <th className='px-4 py-3 text-xs font-semibold tracking-wide uppercase'>
                    Cantitate
                  </th>
                  <th className='px-4 py-3 text-xs font-semibold tracking-wide uppercase'>
                    Comenzi
                  </th>
                  <th className='px-4 py-3 text-xs font-semibold tracking-wide uppercase'>
                    Date livrare
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-neutral-200'>
                {productRows.map((product) => (
                  <tr
                    key={`${product.productId}-${product.productName}`}
                    className='hover:bg-primary-50/60'
                  >
                    <td className='text-primary-900 px-4 py-4 text-sm font-semibold'>
                      {product.productName}
                    </td>
                    <td className='px-4 py-4'>
                      <span className='bg-primary-50 text-primary-900 inline-flex min-w-16 justify-center rounded-full px-3 py-1 text-sm font-bold'>
                        {product.totalQuantity}
                      </span>
                    </td>
                    <td className='px-4 py-4 text-sm text-neutral-700'>
                      {product.orders}
                    </td>
                    <td className='px-4 py-4 text-sm text-neutral-700'>
                      {product.deliveryDates}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersAdminPanel;
