import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog'; // Tambah Title/Desc
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import pesan from '@/routes/pesan';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Loader2, ScanIcon, QrCode, AlertCircle, RefreshCcw } from 'lucide-react';
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

    // State Kamera
    const [isInitializing, setIsInitializing] = useState(true);
    const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const typeRef = useRef<'check_in' | 'check_out'>(type);

    useEffect(() => {
        typeRef.current = type;
    }, [type]);

    // === LOGIC PENEMUAN KAMERA (PRE-FLIGHT) ===
    useEffect(() => {
        let stream: MediaStream | null = null;

        const initializeCamera = async () => {
            if (!open) {
                // Reset semua saat tutup
                setActiveDeviceId(undefined);
                setCameraError(null);
                setIsInitializing(false);
                return;
            }

            setIsInitializing(true);
            setCameraError(null);

            try {
                console.log("🎣 Memulai pancingan kamera (Pre-flight)...");

                // 1. Minta akses video PALING DASAR (Tanpa syarat apapun)
                // Agar kamera VGA tua pun bisa masuk
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });

                // 2. Ambil ID dari kamera yang diberikan browser
                const videoTracks = stream.getVideoTracks();
                if (videoTracks.length > 0) {
                    const track = videoTracks[0];
                    const settings = track.getSettings();
                    const detectedId = settings.deviceId;

                    console.log("✅ Kamera ditemukan:", track.label);
                    console.log("✅ ID:", detectedId);

                    setActiveDeviceId(detectedId);
                } else {
                    throw new Error("Stream aktif tapi track video tidak ada.");
                }

            } catch (err) {
                const e = err as Error;
                console.error("❌ Pancingan Gagal:", e);

                let msg = "Gagal mengakses kamera.";
                if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                    msg = "Izin kamera ditolak browser.";
                } else if (e.name === 'NotFoundError') {
                    msg = "Tidak ada webcam terdeteksi.";
                } else if (e.name === 'NotReadableError') {
                    msg = "Kamera sedang dipakai aplikasi lain (Zoom/Gmeet?).";
                } else {
                    msg = `Error: ${e.name}`;
                }
                setCameraError(msg);
            } finally {
                // 3. Matikan stream pancingan segera agar Scanner bisa pakai ID-nya
                if (stream) {
                    stream.getTracks().forEach(t => t.stop());
                }
                setIsInitializing(false);
            }
        };

        initializeCamera();

        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
    }, [open]);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const submitOrderScan = async (orderId: string) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const currentType = typeRef.current;

        try {
            const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
            const payload = { orderId, type: currentType, _token: token };

            router.post(pesan.checkInOutOrder().url, payload, {
                preserveScroll: true,
                onSuccess: async () => {
                    toast.success(`Berhasil ${currentType === 'check_in' ? 'Check-in' : 'Check-out'}`, {
                        description: `Kode: ${orderId}`
                    });
                    await sleep(2000);
                    setIsSubmitting(false);
                    setManualCode('');
                },
                onError: () => setIsSubmitting(false),
            });
        } catch (e) {
            toast.error('Terjadi kesalahan sistem.');
            setIsSubmitting(false);
        }
    };

    const handleScan = (detectedCodes: { rawValue: string }[]) => {
        if (detectedCodes.length > 0 && !isSubmitting) {
            const rawValue = detectedCodes[0].rawValue;
            if (rawValue) {
                console.log("✅ QR Code Terbaca:", rawValue);
                submitOrderScan(rawValue);
            }
        }
    };

    const onSubmitManual = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = manualCode.trim();
        if (!code) {
            toast.warning('Masukkan kode terlebih dahulu.');
            return;
        }
        await submitOrderScan(code);
    };

    if (auth?.user?.role === 'user') return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <ScanIcon className="mr-2 h-4 w-4" />
                    Scan QR
                </Button>
            </DialogTrigger>

            {/* FIX ACCESSABILITY WARNING */}
            <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
                <DialogTitle className="sr-only">Scan QR Code</DialogTitle>
                <DialogDescription className="sr-only">
                    Gunakan kamera untuk scan barcode pesanan
                </DialogDescription>

                <CardHeader className="flex w-full flex-col gap-3 space-y-0 p-0">
                    <div className="flex w-full flex-col gap-1">
                        <div className="text-base font-semibold">Scan QR Code</div>
                        <div className="text-sm text-muted-foreground">
                            Mode: <b>{type === 'check_in' ? 'Check-In' : 'Check-Out'}</b>
                        </div>
                    </div>
                </CardHeader>

                <div className="flex w-full items-center gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => setType('check_in')} className={cn('w-1/2', type === 'check_in' && 'bg-primary text-primary-foreground')}>Check-in</Button>
                    <Button variant="outline" size="sm" onClick={() => setType('check_out')} className={cn('w-1/2', type === 'check_out' && 'bg-primary text-primary-foreground')}>Check-out</Button>
                </div>

                <CardContent className="flex flex-1 flex-col items-center justify-center gap-6 px-0 mt-4">
                    <div className="relative w-full aspect-square max-w-[300px] overflow-hidden rounded-lg border bg-black shadow-inner">

                        {/* Loading Pancingan */}
                        {isInitializing && open && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-black z-30">
                                <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                                <span className="text-xs">Inisialisasi Kamera...</span>
                            </div>
                        )}

                        {/* Error State */}
                        {!isInitializing && cameraError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-4 text-center z-30">
                                <AlertCircle className="h-10 w-10 text-destructive mb-2" />
                                <p className="text-sm font-medium text-destructive mb-1">Error Kamera</p>
                                <p className="text-xs text-muted-foreground mb-4">{cameraError}</p>
                                <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                                    <RefreshCcw className="mr-2 h-3 w-3" /> Refresh
                                </Button>
                            </div>
                        )}

                        {/* SCANNER UTAMA */}
                        {!isInitializing && !cameraError && activeDeviceId && open && (
                            <Scanner
                                // KEY POINT 1: Gunakan ID hasil pancingan
                                // KEY POINT 2: set resolusi ke IDEAL (bukan exact/min) agar VGA kamera tidak crash
                                constraints={{
                                    deviceId: activeDeviceId,
                                    width: { ideal: 640 },  // Request resolusi rendah (VGA)
                                    height: { ideal: 480 }, // Request resolusi rendah (VGA)
                                    // facingMode JANGAN DISET SAMA SEKALI DISINI
                                }}
                                onScan={handleScan}
                                onError={(err) => {
                                    console.warn("Scanner runtime warning:", err);
                                    // Abaikan error di sini jika kamera visualnya masih jalan
                                }}
                                paused={isSubmitting}
                                components={{ torch: false, finder: true }}
                                styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
                                scanDelay={2000}
                            />
                        )}

                        {isSubmitting && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-40 text-white backdrop-blur-[2px]">
                                <Loader2 className="h-10 w-10 animate-spin mb-2" />
                                <span className="text-sm font-medium">Memproses...</span>
                            </div>
                        )}
                    </div>

                    <div className="w-full space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-xs text-muted-foreground">ATAU MANUAL</span>
                            <div className="h-px flex-1 bg-border" />
                        </div>
                        <form onSubmit={onSubmitManual} className="flex w-full items-center gap-2">
                            <Input placeholder="Kode pesanan..." value={manualCode} onChange={(e) => setManualCode(e.target.value)} disabled={isSubmitting} className="flex-1" />
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />} Proses
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </DialogContent>
        </Dialog>
    );
};