import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import absensiKaryawan from '@/routes/absensi-karyawan';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Camera, CameraOff, Loader2, QrCode } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type ScanState =
    | 'idle'
    | 'requesting-permission'
    | 'streaming'
    | 'no-permission'
    | 'not-supported'
    | 'error';

export const ScanCameraAttendance = () => {
    const { auth } = usePage<SharedData>().props;
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<number | null>(null);
    const detectorRef = useRef<BarcodeDetector | null>(null);

    const [scanState, setScanState] = useState<ScanState>('idle');
    const [detected, setDetected] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [manualCode, setManualCode] = useState('');

    // === LOCKS & COOLDOWN ===
    const submittingRef = useRef(false); // kunci sinkron (instan)
    const lastAttemptRef = useRef<{ code: string | null; at: number }>({
        code: null,
        at: 0,
    });
    const SCAN_COOLDOWN_MS = 2500;

    const csrf = useMemo(() => {
        const el = document.querySelector(
            'meta[name="csrf-token"]',
        ) as HTMLMetaElement | null;
        return el?.content ?? '';
    }, []);

    const pauseDetectLoop = () => {
        if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const beginDetectLoop = () => {
        if (!detectorRef.current || !videoRef.current) return;
        // sampling setiap 350ms biar irit
        timerRef.current = window.setInterval(async () => {
            try {
                if (!videoRef.current) return;
                if (submittingRef.current) return; // sudah submitting? jangan deteksi dulu
                const codes = await detectorRef?.current?.detect(
                    videoRef.current,
                );
                if (codes && codes.length > 0) {
                    const raw = codes[0].rawValue?.trim();
                    if (!raw) return;

                    // cooldown kode yang sama biar nggak kebanjiran
                    const now = Date.now();
                    if (
                        lastAttemptRef.current.code === raw &&
                        now - lastAttemptRef.current.at < SCAN_COOLDOWN_MS
                    ) {
                        return;
                    }
                    lastAttemptRef.current = { code: raw, at: now };

                    // kunci dulu sebelum submit; pause loop biar aman
                    submittingRef.current = true;
                    setIsSubmitting(true);
                    pauseDetectLoop();

                    setDetected(raw);
                    await submitAttendance(raw);

                    // kalau masih streaming & belum reload, bisa lanjut scan lagi (delay dikit)
                    if (scanState === 'streaming') {
                        setTimeout(() => {
                            if (!timerRef.current && !submittingRef.current) {
                                beginDetectLoop();
                            }
                        }, 1000);
                    }
                }
            } catch (err) {
                // abaikan error deteksi
                console.debug(err);
            }
        }, 350);
    };

    // start camera
    const startCamera = async () => {
        setDetected(null);
        if (!('BarcodeDetector' in window)) {
            setScanState('not-supported');
            toast.message(
                'Perangkat tidak mendukung scan native, gunakan input manual.',
            );
            return;
        }

        try {
            setScanState('requesting-permission');

            try {
                if (window.BarcodeDetector) {
                    detectorRef.current = new window.BarcodeDetector({
                        formats: ['qr_code'],
                    });
                }
            } catch {
                detectorRef.current = null;
            }
            if (!detectorRef.current) {
                setScanState('not-supported');
                toast.message(
                    'Barcode detector tidak tersedia. Gunakan input manual.',
                );
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } },
                audio: false,
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setScanState('streaming');
            beginDetectLoop();
        } catch (err) {
            const e = err as Error;
            if (e?.name === 'NotAllowedError') {
                setScanState('no-permission');
                toast.error('Izin kamera ditolak.');
            } else {
                setScanState('error');
                toast.error('Gagal mengakses kamera.');
                console.error(e);
            }
        }
    };

    const stopCamera = () => {
        pauseDetectLoop();
        if (videoRef.current) {
            try {
                videoRef.current.pause();
                videoRef.current.srcObject = null;
            } catch {
                // ignore
            }
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setScanState('idle');
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // SATU PINTU SUBMIT (dipakai kamera & manual)
    const submitAttendance = async (code: string) => {
        try {
            const res = await fetch(absensiKaryawan.makeAttendance().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                credentials: 'same-origin',
                body: JSON.stringify({ attendanceKey: code }),
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data?.message ?? 'Gagal melakukan presensi.');
            } else {
                toast.success(data?.message ?? 'Presensi berhasil!');
                await sleep(800);
                window.location.reload();
            }
        } catch (e) {
            console.error(e);
            toast.error('Gagal terhubung ke server.');
        } finally {
            // lepas kunci & UI
            submittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    const onSubmitManual = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = manualCode.trim();
        if (!code) {
            toast.message('Masukkan kode terlebih dahulu.');
            return;
        }
        if (submittingRef.current) return;

        // kunci di awal supaya manual & kamera konsisten
        submittingRef.current = true;
        setIsSubmitting(true);
        await submitAttendance(code);
    };

    if (auth?.user?.role !== 'admin') {
        return null;
    }

    return (
        <Card className="flex h-[min(100%,80vh)] flex-1 flex-col">
            <CardHeader className="flex flex-col gap-3 space-y-0">
                <div className="flex flex-col gap-1">
                    <div className="text-base font-semibold">Scan QR Code</div>
                    <div className="text-sm text-muted-foreground">
                        Arahkan kamera ke QR Code untuk melakukan absensi atau
                        masukkan kode manual di bawah.
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {scanState === 'streaming' ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={stopCamera}
                            disabled={isSubmitting}
                        >
                            <CameraOff className="mr-2 h-4 w-4" />
                            Matikan Kamera
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={startCamera}
                            disabled={isSubmitting}
                        >
                            <Camera className="mr-2 h-4 w-4" />
                            Nyalakan Kamera
                        </Button>
                    )}

                    <Badge variant="outline">
                        {scanState === 'idle' && 'Siap'}
                        {scanState === 'requesting-permission' &&
                            'Meminta izin kamera…'}
                        {scanState === 'streaming' && 'Memindai…'}
                        {scanState === 'no-permission' && 'Izin kamera ditolak'}
                        {scanState === 'not-supported' &&
                            'Pemindaian tidak didukung'}
                        {scanState === 'error' && 'Galat kamera'}
                    </Badge>

                    {detected && (
                        <Badge>
                            <QrCode className="mr-1 h-3 w-3" />
                            {detected}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col items-center justify-center gap-6 px-0">
                {/* CAMERA PREVIEW */}
                <div className="relative w-full max-w-xl">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                        <video
                            ref={videoRef}
                            className="size-full object-cover"
                            muted
                            playsInline
                            autoPlay
                        />
                        {scanState === 'streaming' && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="h-40 w-40 rounded-md border-2 border-white/70 shadow-[0_0_0_100vmax_rgba(0,0,0,0.35)]" />
                            </div>
                        )}
                    </div>
                </div>

                {/* MANUAL INPUT */}
                <form
                    onSubmit={onSubmitManual}
                    className="flex w-full max-w-md items-center gap-2 px-4 md:px-0"
                >
                    <Input
                        placeholder="Masukkan kode presensi…"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Kirim
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

// TS helpers
declare global {
    interface Window {
        BarcodeDetector?: {
            new (options?: { formats?: string[] }): BarcodeDetector;
            getSupportedFormats?: () => Promise<string[]>;
        };
    }
    interface BarcodeDetector {
        detect: (
            source: CanvasImageSource | ImageBitmap | HTMLVideoElement,
        ) => Promise<Array<{ rawValue: string }>>;
    }
}
