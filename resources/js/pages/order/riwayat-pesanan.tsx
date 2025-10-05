// resources/js/Pages/riwayat-pesanan.tsx
import { useSearchPagination } from '@/components/search/search-pagination-provider';
import { ShowTable } from '@/components/search/show-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatIdr, initialsFromName } from '@/lib/helper';
import { dashboard, riwayatPesanan } from '@/routes';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Calendar as CalendarIcon,
    DownloadIcon,
    UploadIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { ScanCameraOrder } from './(components)/scan-camera-order';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface Order {
    id: string;
    user_id: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    tax: number;
    subtotal: number;
    total: number;
    pool_price: number;
    amount: number;
    time: number; // 8..21
    date: string; // "yyyy-MM-dd"  <-- dipakai untuk filter!
    midtrans_snap_token: string;
    midtrans_redirect_url: string;
    created_at: string;
    updated_at: string;
    order_details: OrderDetail[];
    user: User;
    check_in_at: string | null; // datetime string
    check_out_at: string | null; // datetime string
}
interface OrderDetail {
    id: string;
    order_id: string;
    facility_id: number;
    quantity: number;
    price: number;
    total: number;
    created_at: string;
    updated_at: string;
    facility: Facility;
}
interface Facility {
    id: number;
    facility_name: string;
    facility_price: number;
    facility_description: string;
    facility_image: string | null;
    facility_type: string;
    created_at: string;
    updated_at: string;
}
interface User {
    id: number;
    name: string;
    email: string;
    image: string | null;
    created_at: string;
    updated_at: string;
}

/* ------------------------------------------------------------------ */
type OrderRow = {
    id: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    total: number;
    date: string; // "yyyy-MM-dd"
    timeText: string; // "HH:00 WIB"
    created_at: string;
    userName: string;
    userEmail: string;
    userImage: string | null;
    checkInAt: string | null;
    checkOutAt: string | null;
};

type StatusFilterValue = 'all' | 'pending' | 'confirmed' | 'cancelled';

export default function RiwayatPesanan({ orders }: { orders: Order[] }) {
    const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
    const [range, setRange] = useState<DateRange | undefined>(); // undefined => semua
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth?.user?.role !== 'user';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        {
            title: isAdmin ? 'Kelola Reservasi' : 'Riwayat Pesanan Saya',
            href: riwayatPesanan().url,
        },
    ];

    // 1) Filter status (client)
    const filteredByStatus = useMemo(() => {
        if (statusFilter === 'all') return orders;
        return orders.filter((o) => o.status === statusFilter);
    }, [orders, statusFilter]);

    // 2) Filter tanggal BERDASAR "order.date" (string 'yyyy-MM-dd', inclusive)
    const filtered = useMemo(() => {
        // jika tidak ada rentang, tampilkan semua
        if (!range?.from && !range?.to) return filteredByStatus;

        // toYMD: pastikan 'yyyy-MM-dd'
        const toYMD = (d: Date) => format(d, 'yyyy-MM-dd');

        let fromStr: string | null = range?.from ? toYMD(range.from) : null;
        let toStr: string | null = range?.to
            ? toYMD(range.to)
            : (fromStr ?? null); // single-day: to=from

        // Jika user klik 'akhir' duluan atau terjadi "terbalik", swap agar from<=to
        if (fromStr && toStr && fromStr > toStr) {
            const tmp = fromStr;
            fromStr = toStr;
            toStr = tmp;
        }

        // Inclusive filter dengan membandingkan string 'yyyy-MM-dd'
        return filteredByStatus.filter((o) => {
            if (fromStr && o.date < fromStr) return false;
            if (toStr && o.date > toStr) return false;
            return true;
        });
    }, [filteredByStatus, range]);

    // 3) Flatten ke row
    const rows: OrderRow[] = useMemo(
        () =>
            filtered.map((o) => ({
                id: o.id,
                status: o.status,
                total: o.total,
                date: o.date,
                timeText: `${String(o.time).padStart(2, '0')}:00 WIB`,
                created_at: o.created_at,
                userName: o.user?.name ?? '-',
                userEmail: o.user?.email ?? '-',
                userImage: o.user?.image ?? null,
                checkInAt: o.check_in_at ?? null,
                checkOutAt: o.check_out_at ?? null,
            })),
        [filtered],
    );

    // 4) Sort default: terbaru (created_at) lalu id
    const sortedRows = useMemo(
        () =>
            [...rows].sort((a, b) => {
                const t =
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime();
                if (t !== 0) return t;
                return a.id.localeCompare(b.id);
            }),
        [rows],
    );

    const totalBookings = useMemo(() => {
        return rows.filter(
            (r) => r.status === 'confirmed' && !r.checkInAt && !r.checkOutAt,
        ).length;
    }, [rows]);
    const checkInBookings = useMemo(() => {
        return rows.filter(
            (r) => r.status === 'confirmed' && r.checkInAt && !r.checkOutAt,
        ).length;
    }, [rows]);
    const checkOutBookings = useMemo(() => {
        return rows.filter(
            (r) => r.status === 'confirmed' && r.checkInAt && r.checkOutAt,
        ).length;
    }, [rows]);

    const [openScanCameraOrder, setOpenScanCameraOrder] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Pesanan" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {isAdmin && (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row justify-between gap-3 space-y-0">
                                <div className="flex flex-col gap-1">
                                    <div className="text-base font-semibold">
                                        Kelola Reservasi
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        Kelola dan validasi reservasi pelanggan
                                    </span>
                                </div>
                                {/* Rentang tanggal (filter by order.date) */}
                                <div className="flex flex-col items-end gap-2">
                                    <Label className="text-sm">
                                        Rentang Tanggal
                                    </Label>
                                    <DateRangeFilter
                                        value={range}
                                        onChange={setRange}
                                    />
                                </div>
                            </CardHeader>
                        </Card>
                        <div className="grid grid-cols-3 gap-3">
                            <Card className="flex flex-col items-center justify-center gap-0 bg-primary text-primary-foreground">
                                <div className="text-2xl font-bold">
                                    {totalBookings}
                                </div>
                                <div className="text-sm font-medium">
                                    Total Reservasi
                                </div>
                            </Card>
                            <Card className="flex flex-col items-center justify-center gap-0 bg-primary text-primary-foreground">
                                <div className="text-2xl font-bold">
                                    {checkInBookings}
                                </div>
                                <div className="text-sm font-medium">
                                    Check-in
                                </div>
                            </Card>
                            <Card className="flex flex-col items-center justify-center gap-0 bg-primary text-primary-foreground">
                                <div className="text-2xl font-bold">
                                    {checkOutBookings}
                                </div>
                                <div className="text-sm font-medium">
                                    Check-out
                                </div>
                            </Card>
                        </div>
                    </>
                )}
                <Card className="flex h-[min(100%,80vh)] flex-1 flex-col">
                    <CardHeader className="flex flex-col gap-3 space-y-0">
                        <div className="text-base font-semibold">
                            Riwayat Pesanan
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-4">
                                    {/* Status */}
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm">
                                            Filter Status
                                        </Label>
                                        <StatusFilter
                                            value={statusFilter}
                                            onChange={setStatusFilter}
                                        />
                                    </div>

                                    {/* Rentang tanggal (filter by order.date) */}
                                    {!isAdmin && (
                                        <div className="flex items-center gap-2">
                                            <Label className="text-sm">
                                                Rentang Tanggal
                                            </Label>
                                            <DateRangeFilter
                                                value={range}
                                                onChange={setRange}
                                            />
                                        </div>
                                    )}
                                </div>

                                <ScanCameraOrder
                                    open={openScanCameraOrder}
                                    onOpenChange={setOpenScanCameraOrder}
                                />
                            </div>

                            <ShowTable<OrderRow>
                                table={<OrdersTable />}
                                data={sortedRows}
                                keys={[
                                    'id',
                                    'userName',
                                    'userEmail',
                                    'status',
                                    'date',
                                    'timeText',
                                    'checkInAt',
                                    'checkOutAt',
                                ]}
                                placeholder="Cari id, nama, email, status…"
                                pageSize={10}
                            />
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </AppLayout>
    );
}

/* --------------------------- Status Filter -------------------------- */
function StatusFilter({
    value,
    onChange,
}: {
    value: StatusFilterValue;
    onChange: (v: StatusFilterValue) => void;
}) {
    return (
        <Select
            value={value}
            onValueChange={(v) => onChange(v as StatusFilterValue)}
        >
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
                <SelectItem value="confirmed">Dibayar</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
            </SelectContent>
        </Select>
    );
}

/* -------------------------- DateRange Filter ------------------------ */
function DateRangeFilter({
    value,
    onChange,
}: {
    value: DateRange | undefined;
    onChange: (v: DateRange | undefined) => void;
}) {
    const label = (() => {
        if (!value?.from && !value?.to) return 'Semua tanggal';
        if (value?.from && !value?.to)
            return `${format(value.from, 'dd MMM yyyy')}`;
        if (value?.from && value?.to)
            return `${format(value.from, 'dd MMM yyyy')} — ${format(value.to, 'dd MMM yyyy')}`;
        return 'Semua tanggal';
    })();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {label}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Pilih Rentang</Label>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onChange(undefined)}
                        >
                            Semua
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                const today = new Date();
                                onChange({ from: today, to: today });
                            }}
                        >
                            Hari ini
                        </Button>
                    </div>
                </div>
                <div className="mt-2 rounded-md border">
                    <Calendar
                        mode="range"
                        numberOfMonths={2}
                        selected={value}
                        onSelect={(r) => onChange(r)}
                        initialFocus
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}

/* ------------------------------- Tabel ------------------------------ */
function OrdersTable() {
    const { items } = useSearchPagination<OrderRow>();
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth?.user?.role !== 'user';

    const handleCheckInOut = async (
        orderId: string,
        type: 'check_in' | 'check_out',
    ) => {
        const token = (
            document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
        )?.content;
        router.post(
            '/pesan/check-in-out-order',
            { orderId, type, _token: token },
            {
                preserveScroll: true,
                onSuccess: () => {},
            },
        );
    };

    return (
        <ScrollArea className="h-full w-full">
            <Table className="min-w-[1100px]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[30%]">
                            Order / Pengguna
                        </TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Check-in / Check-out</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Dipesan Pada</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((r) => (
                        <TableRow key={r.id}>
                            {/* Order / User */}
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage
                                            src={r.userImage ?? undefined}
                                            alt={r.userName}
                                        />
                                        <AvatarFallback>
                                            {initialsFromName(r.userName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex min-w-0 flex-col">
                                        <span className="font-medium">
                                            {r.userName}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {r.userEmail}
                                        </span>
                                        <span className="mt-1 font-mono text-xs text-muted-foreground">
                                            ID: {r.id}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>

                            {/* Tanggal reservasi (dari order.date) + jam slot */}
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    <span>
                                        {format(
                                            new Date(r.date),
                                            'dd MMM yyyy',
                                        )}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {r.timeText}
                                    </span>
                                </div>
                            </TableCell>

                            {/* Check-in / Check-out (gabung 1 kolom, tampilkan tanggal+jam) */}
                            <TableCell>
                                <div className="flex flex-col gap-1 text-sm">
                                    <div className="text-xs text-muted-foreground">
                                        Check-in
                                    </div>
                                    <div className="font-medium">
                                        {r.checkInAt
                                            ? format(
                                                  new Date(r.checkInAt),
                                                  'dd MMM yyyy HH:mm',
                                              )
                                            : '-'}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        Check-out
                                    </div>
                                    <div className="font-medium">
                                        {r.checkOutAt
                                            ? format(
                                                  new Date(r.checkOutAt),
                                                  'dd MMM yyyy HH:mm',
                                              )
                                            : '-'}
                                    </div>
                                </div>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                                <StatusBadge status={r.status} />
                            </TableCell>

                            {/* Total */}
                            <TableCell className="font-semibold">
                                {formatIdr(r.total)}
                            </TableCell>

                            {/* Dipesan Pada */}
                            <TableCell>
                                {format(
                                    new Date(r.created_at),
                                    'dd MMM yyyy HH:mm',
                                )}
                            </TableCell>

                            {/* Action */}
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline">
                                        <a
                                            href={`/pesan/invoice/${r.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Detail
                                        </a>
                                    </Button>
                                    {isAdmin &&
                                        r.status === 'confirmed' &&
                                        !r.checkInAt && (
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    handleCheckInOut(
                                                        r.id,
                                                        'check_in',
                                                    )
                                                }
                                            >
                                                <DownloadIcon className="h-4 w-4" />
                                                Check-in
                                            </Button>
                                        )}
                                    {isAdmin &&
                                        r.status === 'confirmed' &&
                                        r.checkInAt &&
                                        !r.checkOutAt && (
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    handleCheckInOut(
                                                        r.id,
                                                        'check_out',
                                                    )
                                                }
                                            >
                                                <UploadIcon className="h-4 w-4" />
                                                Check-out
                                            </Button>
                                        )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}

                    {items.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="py-10 text-center text-muted-foreground"
                            >
                                Tidak ada data untuk ditampilkan.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}

/* ----------------------------- Badge -------------------------------- */
function StatusBadge({ status }: { status: OrderRow['status'] }) {
    const s = (status || '').toLowerCase();
    if (s === 'confirmed') return <Badge>Dibayar</Badge>;
    if (s === 'pending')
        return <Badge variant="secondary">Menunggu Pembayaran</Badge>;
    if (s === 'cancelled')
        return <Badge variant="destructive">Dibatalkan</Badge>;
    return <Badge variant="outline">{status || '-'}</Badge>;
}
