import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Props {
    attendanceKey: string;
}

function nextFiveMinuteBoundary(from: Date): Date {
    const d = new Date(from);
    d.setSeconds(0, 0);
    const m = d.getMinutes();
    const remainder = m % 5;
    const add = remainder === 0 ? 5 : 5 - remainder; // selalu ke kelipatan 5 SETELAH sekarang
    d.setMinutes(m + add);
    return d;
}

function hhmm(d: Date): string {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

export const ShowAttendance = ({ attendanceKey }: Props) => {
    const { auth } = usePage<SharedData>().props;
    const isSuperadmin = auth?.user?.role === 'superadmin';
    const [qrSrc, setQrSrc] = useState<string>('');
    const [validUntil, setValidUntil] = useState<Date>(() =>
        nextFiveMinuteBoundary(new Date()),
    );
    const [remainingMs, setRemainingMs] = useState<number>(0);

    const reloadTimerRef = useRef<number | null>(null);
    const tickTimerRef = useRef<number | null>(null);

    // Generate QR setiap key berubah
    useEffect(() => {
        let mounted = true;
        (async () => {
            const QR = await import('qrcode');
            const dataUrl = await QR.toDataURL(attendanceKey, {
                width: 240,
                margin: 1,
                errorCorrectionLevel: 'M',
            });
            if (mounted) setQrSrc(dataUrl);
        })().catch(console.error);
        return () => {
            mounted = false;
        };
    }, [attendanceKey]);

    // Set jadwal refresh + countdown
    useEffect(() => {
        // hitung boundary & sisa waktu
        const now = new Date();
        const boundary = nextFiveMinuteBoundary(now);

        // buffer 3 detik supaya kode di server sempat berganti
        const BUFFER_MS = 3000;

        setValidUntil(boundary);
        setRemainingMs(boundary.getTime() - now.getTime() + BUFFER_MS);

        // timer reload sekali
        if (reloadTimerRef.current) window.clearTimeout(reloadTimerRef.current);
        reloadTimerRef.current = window.setTimeout(
            () => {
                // reload halaman agar attendanceKey terbaru terambil dari server
                if (isSuperadmin) {
                    window.location.reload();
                }
            },
            boundary.getTime() - now.getTime() + BUFFER_MS,
        );

        // timer tick per 1 detik (countdown UI)
        if (tickTimerRef.current) window.clearInterval(tickTimerRef.current);
        tickTimerRef.current = window.setInterval(() => {
            const tNow = new Date().getTime();
            const remain = boundary.getTime() - tNow + BUFFER_MS;
            setRemainingMs(remain > 0 ? remain : 0);
        }, 1000);

        return () => {
            if (reloadTimerRef.current)
                window.clearTimeout(reloadTimerRef.current);
            if (tickTimerRef.current)
                window.clearInterval(tickTimerRef.current);
        };
    }, [attendanceKey]); // ketika key berubah (pasca reload), penjadwalan direset

    const remainingLabel = useMemo(() => {
        const total = Math.max(0, Math.floor(remainingMs / 1000));
        const mm = Math.floor(total / 60);
        const ss = total % 60;
        if (mm > 0) return `${mm}m ${ss}s`;
        return `${ss}s`;
    }, [remainingMs]);

    if (!isSuperadmin) {
        return null;
    }

    return (
        <Card className="flex h-[min(100%,80vh)] flex-1 flex-col">
            <CardHeader className="flex flex-col gap-3 space-y-0">
                <div className="flex flex-col gap-1">
                    <div className="text-base font-semibold">Scan QR Code</div>
                    <div className="text-sm text-muted-foreground">
                        Arahkan kamera ke QR Code untuk melakukan absensi.
                    </div>
                    <div className="text-sm">
                        <span className="text-muted-foreground">
                            Kode presensi valid hingga
                        </span>{' '}
                        <b>{hhmm(validUntil)} WIB</b>
                        <span className="text-muted-foreground">
                            {' '}
                            — memperbarui otomatis dalam{' '}
                        </span>
                        <b>{remainingLabel}</b>.
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center px-0">
                <div className="mt-6 flex flex-col items-center justify-center rounded-lg border p-4">
                    {qrSrc ? (
                        <img
                            src={qrSrc}
                            alt={`QR ${attendanceKey}`}
                            className="h-40 w-40 rounded bg-white p-2"
                        />
                    ) : (
                        <div className="h-40 w-40 animate-pulse rounded bg-muted" />
                    )}
                    <p className="mt-2 font-mono text-xs text-muted-foreground">
                        Tunjukkan QR ini ke kamera untuk presensi.
                    </p>

                    <Label htmlFor="attendanceKey" className="mt-4 mb-2 w-full">
                        Kode Presensi (teks)
                    </Label>
                    <Input disabled value={attendanceKey} className="w-full" />
                </div>
            </CardContent>
        </Card>
    );
};
