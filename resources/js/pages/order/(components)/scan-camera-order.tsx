import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import pesan from '@/routes/pesan';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Loader2, ScanIcon, QrCode } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ScanCameraOrder = ({ open, onOpenChange }: Props) => {
    const { auth } = usePage<SharedData>().props;

    // State
    const [type, setType] = useState<'check_in' | 'check_out'>('check_in');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [manualCode, setManualCode] = useState('');

    // Ref untuk menjaga state tipe scan saat callback scanner berjalan
    const typeRef = useRef<'check_in' | 'check_out'>(type);
    useEffect(() => {
        typeRef.current = type;
    }, [type]);

    // Reset saat dialog dibuka/tutup
    useEffect(() => {
        if (open) {
            setIsSubmitting(false);
            setManualCode('');
        }
    }, [open]);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // Fungsi Submit Utama (digunakan oleh Scanner & Manual Input)
    const submitOrderScan = async (
        orderId: string,
    ) => {
        if (isSubmitting) return; // Cegah double submit

        setIsSubmitting(true);
        const currentType = typeRef.current;

        try {
            // Ambil CSRF token
            const token =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

            const payload = { orderId, type: currentType, _token: token };

            router.post(pesan.checkInOutOrder().url, payload, {
                preserveScroll: true,
                onSuccess: async () => {
                    toast.success(`Berhasil ${currentType === 'check_in' ? 'Check-in' : 'Check-out'}`, {
                        description: `Kode: ${orderId}`
                    });

                    // Jeda sebentar agar user lihat notifikasi sebelum kamera aktif lagi
                    await sleep(2000);
                    setIsSubmitting(false);
                    setManualCode('');
                },
                onError: (errors) => {
                    console.error(errors);
                    // Jika error validasi, izinkan scan lagi segera
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    // Pastikan loading mati jika ada error jaringan dsb
                    // setIsSubmitting(false); // Opsional: biarkan logic onSuccess/onError yang handle
                }
            });
        } catch (e) {
            console.error(e);
            toast.error('Terjadi kesalahan sistem.');
            setIsSubmitting(false);
        }
    };

    // Handler saat QR terdeteksi
    const handleScan = (detectedCodes: { rawValue: string }[]) => {
        if (detectedCodes.length > 0 && !isSubmitting) {
            const rawValue = detectedCodes[0].rawValue;
            if (rawValue) {
                submitOrderScan(rawValue);
            }
        }
    };

    // Handler Submit Manual
    const onSubmitManual = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = manualCode.trim();
        if (!code) {
            toast.warning('Masukkan kode terlebih dahulu.');
            return;
        }
        await submitOrderScan(code);
    };

    if (auth?.user?.role === 'user') {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <ScanIcon className="mr-2 h-4 w-4" />
                    Scan QR
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <CardHeader className="flex w-full flex-col gap-3 space-y-0 p-0">
                    <div className="flex w-full flex-col gap-1">
                        <div className="text-base font-semibold">
                            Scan QR Code
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Mode: <b>{type === 'check_in' ? 'Check-In' : 'Check-Out'}</b>
                        </div>
                    </div>
                </CardHeader>

                {/* Tombol Switch Mode */}
                <div className="flex w-full items-center gap-2 mt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setType('check_in')}
                        className={cn(
                            'w-1/2',
                            type === 'check_in' &&
                            'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
                        )}
                        disabled={isSubmitting}
                    >
                        Check-in
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setType('check_out')}
                        className={cn(
                            'w-1/2',
                            type === 'check_out' &&
                            'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
                        )}
                        disabled={isSubmitting}
                    >
                        Check-out
                    </Button>
                </div>

                <CardContent className="flex flex-1 flex-col items-center justify-center gap-6 px-0 mt-4">
                    {/* AREA KAMERA */}
                    <div className="relative w-full aspect-square max-w-[300px] overflow-hidden rounded-lg border bg-black shadow-inner">
                        {/* Render Scanner hanya jika dialog buka agar hemat resource */}
                        {open && (
                            <Scanner
                                onScan={handleScan}
                                // Matikan scan jika sedang submitting agar tidak double-scan
                                paused={isSubmitting}
                                components={{
                                    // audio: false,   // Matikan suara bip bawaan
                                    torch: false,
                                    finder: true,   // Tampilkan kotak pembidik
                                }}
                                styles={{
                                    container: { width: '100%', height: '100%' },
                                    video: { objectFit: 'cover' }
                                }}
                                // Delay antar scan (ms) untuk mencegah spam
                                scanDelay={2000}
                            />
                        )}

                        {/* Loading Overlay saat memproses */}
                        {isSubmitting && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 text-white backdrop-blur-[2px]">
                                <Loader2 className="h-10 w-10 animate-spin mb-2" />
                                <span className="text-sm font-medium">Memproses...</span>
                            </div>
                        )}
                    </div>

                    {/* MANUAL INPUT SECTION */}
                    <div className="w-full space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-xs text-muted-foreground">ATAU MANUAL</span>
                            <div className="h-px flex-1 bg-border" />
                        </div>

                        <form
                            onSubmit={onSubmitManual}
                            className="flex w-full items-center gap-2"
                        >
                            <Input
                                placeholder="Kode pesanan (contoh: TRX-123)"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                disabled={isSubmitting}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <QrCode className="mr-2 h-4 w-4" />
                                )}
                                Proses
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </DialogContent>
        </Dialog>
    );
};