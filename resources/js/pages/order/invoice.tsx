// InvoicePage.tsx (props dari server: { order, midtransClientKey })
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { formatIdr } from '@/lib/helper';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CopyIcon, PrinterIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import LandingLayout from '../landing/landing-layout';

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        snap: any;
    }
}

interface Order {
    id: string;
    user_id: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    tax: number;
    pool_price: number;
    subtotal: number;
    total: number;
    amount: number;
    time: number; // 8..21
    date: string; // ISO string
    midtrans_snap_token: string;
    midtrans_redirect_url: string;
    created_at: string;
    updated_at: string;
    order_details: OrderDetail[];
    user: User;
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
    role: 'user';
    created_at: string;
    updated_at: string;
}

interface InvoicePageProps {
    order: Order;
    midtransClientKey: string;
}

export default function InvoicePage({
    order,
    midtransClientKey,
}: InvoicePageProps) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth?.user?.role !== 'user';
    // Load Snap.js sekali
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', midtransClientKey);
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, [midtransClientKey]);

    // QR code untuk order.id
    const [qrSrc, setQrSrc] = useState<string>('');
    useEffect(() => {
        let mounted = true;
        (async () => {
            const QR = await import('qrcode'); // dynamic import supaya hanya di client
            const dataUrl = await QR.toDataURL(order.id, {
                width: 240,
                margin: 1,
                errorCorrectionLevel: 'M',
            });
            if (mounted) setQrSrc(dataUrl);
        })().catch(console.error);
        return () => {
            mounted = false;
        };
    }, [order.id]);

    const pay = () => {
        if (!order.midtrans_snap_token || !window.snap) return;
        window.snap.pay(order.midtrans_snap_token, {
            onSuccess() {
                // bisa redirect ke halaman "order sukses"
                // atau reload page untuk ambil status terbaru
                window.location.reload();
            },
            onPending() {
                // biarkan user tetap di invoice (status pending)
            },
            onError(
                data: { error_messages: string[]; status_code: number } | null,
            ) {
                const expiredMessage = 'token has expired';
                if (
                    data?.error_messages?.includes(expiredMessage) ||
                    data?.status_code === 407
                ) {
                    console.log('token has expired');
                    const token = (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content;
                    router.post(`/pesan/cancel-order/${order.id}`, {
                        _token: token,
                    });
                    window.location.reload();
                } else {
                    console.log('token not expired');
                }
            },
            onClose() {
                // user menutup pop-up
            },
        });
    };

    const canPay = order.status === 'pending' && !!order.midtrans_snap_token;

    const statusBadge = useMemo(() => {
        switch (order.status) {
            case 'pending':
                return <Badge variant="outline">Menunggu Pembayaran</Badge>;
            case 'confirmed':
                return (
                    <Badge className="bg-green-600 text-white hover:bg-green-600">
                        Dibayar
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge className="bg-red-600 text-white hover:bg-red-600">
                        Dibatalkan
                    </Badge>
                );
            default:
                return <Badge variant="outline">{order.status}</Badge>;
        }
    }, [order.status]);

    const prettyDate = useMemo(() => {
        try {
            return format(new Date(order.date), 'PPP');
        } catch {
            return order.date;
        }
    }, [order.date]);

    const prettyTime = `${order.time.toString().padStart(2, '0')}:00 WIB - ${(
        order.time + 1
    )
        .toString()
        .padStart(2, '0')}:00 WIB`;

    const copyId = async () => {
        try {
            await navigator.clipboard.writeText(order.id);
        } catch {
            // ignore
        }
    };

    const printInvoice = () => {
        window.print();
    };

    return (
        <LandingLayout className="px-4 py-8 md:px-10 lg:px-12 xl:px-16">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
                {/* Left: Detail invoice */}
                <div className="w-full lg:w-1/3">
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-2xl font-bold">
                                        Invoice
                                    </h1>
                                    {statusBadge}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Dibuat:{' '}
                                    {format(new Date(order.created_at), 'PPPp')}
                                </p>
                            </div>

                            <Separator className="my-4" />

                            {/* Order meta */}
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Order ID
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm">
                                            {order.id}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={copyId}
                                            title="Copy ID"
                                        >
                                            <CopyIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Nama Pemesan
                                    </p>
                                    <p className="font-medium">
                                        {order.user.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.user.email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Jadwal
                                    </p>
                                    <p className="font-medium">{prettyDate}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {prettyTime} &middot; {order.amount}{' '}
                                        orang
                                    </p>
                                </div>
                            </div>

                            {/* QR */}
                            <div className="mt-6 flex flex-col items-center justify-center rounded-lg border p-4">
                                {qrSrc ? (
                                    <img
                                        src={qrSrc}
                                        alt={`QR ${order.id}`}
                                        className="h-40 w-40 rounded bg-white p-2"
                                    />
                                ) : (
                                    <div className="h-40 w-40 animate-pulse rounded bg-muted" />
                                )}
                                <p className="mt-2 font-mono text-xs text-muted-foreground">
                                    #{order.id}
                                </p>
                                <p className="mt-2 font-mono text-xs text-muted-foreground">
                                    Tunjukkan QR ini saat check-in
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Ringkasan & actions */}
                <div className="w-full lg:w-2/3">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold">Ringkasan</h3>
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Tanggal
                                    </span>
                                    <span className="font-medium">
                                        {prettyDate}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Waktu
                                    </span>
                                    <span className="font-medium">
                                        {prettyTime}
                                    </span>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-2 text-sm">
                                    <div className="col-span-6">
                                        <div className="text-muted-foreground">
                                            Tiket
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        {order.amount} x
                                    </div>
                                    <div className="col-span-2 text-right">
                                        {formatIdr(order.pool_price)}
                                    </div>
                                    <div className="col-span-2 text-right font-semibold">
                                        {formatIdr(
                                            order.amount * order.pool_price,
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-4" />
                            <div className="space-y-2 text-sm">
                                <h2 className="mb-4 text-lg font-semibold">
                                    Rincian Fasilitas
                                </h2>

                                <div className="divide-y">
                                    {order.order_details.map((d) => (
                                        <div
                                            key={d.id}
                                            className="grid grid-cols-12 items-center gap-2 py-3 text-sm"
                                        >
                                            <div className="col-span-6">
                                                <div className="font-medium">
                                                    {d.facility.facility_name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {d.facility
                                                        .facility_type ===
                                                    'rent'
                                                        ? 'Sewa'
                                                        : 'Beli'}
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-right">
                                                {d.quantity} x
                                            </div>
                                            <div className="col-span-2 text-right">
                                                {formatIdr(d.price)}
                                            </div>
                                            <div className="col-span-2 text-right font-semibold">
                                                {formatIdr(d.total)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Separator className="my-4" />

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span className="font-medium">
                                        {formatIdr(order.subtotal)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Pajak
                                    </span>
                                    <span className="font-medium">
                                        {formatIdr(order.tax)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-base">
                                    <span className="font-semibold">Total</span>
                                    <span className="text-lg font-bold">
                                        {formatIdr(order.total)}
                                    </span>
                                </div>
                            </div>

                            {!isAdmin && (
                                <div className="mt-6 flex flex-col gap-2">
                                    {canPay && (
                                        <>
                                            <Button
                                                onClick={pay}
                                                className="w-full"
                                            >
                                                Bayar Sekarang
                                            </Button>
                                            <CancelOrderDialog order={order} />
                                        </>
                                    )}
                                    {order.status === 'confirmed' && (
                                        <Button
                                            variant="outline"
                                            onClick={printInvoice}
                                            className="w-full"
                                        >
                                            <PrinterIcon className="mr-2 h-4 w-4" />
                                            Cetak Invoice
                                        </Button>
                                    )}
                                    <Button variant="outline">
                                        <a href={`/pesan/riwayat`}>
                                            Kembali ke Riwayat Pesanan
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </LandingLayout>
    );
}

function CancelOrderDialog({ order }: { order: Order }) {
    const [open, setOpen] = useState(false);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const handleCancelOrder = async () => {
        try {
            const token = (
                document.querySelector(
                    'meta[name="csrf-token"]',
                ) as HTMLMetaElement
            )?.content;
            const res = await fetch(`/pesan/cancel-order/${order.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                },
            });
            const data = await res.json();
            console.log({ data });
            if (!res.ok) {
                throw new Error('Gagal membatalkan pesanan');
            }
            toast.success('Pesanan berhasil dibatalkan');
            await sleep(1000);
            window.location.reload();
        } catch (error) {
            toast.error('Gagal membatalkan pesanan');
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="icon"
                    title="Batalkan pembayaran"
                    className="w-full"
                >
                    Batalkan Pembayaran
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Batalkan Pembayaran</DialogTitle>
                    <DialogDescription>
                        Yakin ingin membatalkan pembayaran pesanan ini?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Batal
                    </Button>
                    <Button variant="destructive" onClick={handleCancelOrder}>
                        Batalkan Pembayaran
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
