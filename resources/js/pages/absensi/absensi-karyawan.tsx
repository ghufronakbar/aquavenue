import { ShowTable } from '@/components/search/show-table';
import { Card, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { absensiKaryawan, dashboard } from '@/routes';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { AbsensiTable } from './(components)/absensi-table';
import { DateFilter } from './(components)/date-filter';
import { ScanCameraAttendance } from './(components)/scan-camera-attendance';
import { ShowAttendance } from './(components)/show-attendance';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Absensi Karyawan', href: absensiKaryawan().url },
];

export type AttendanceStatus = 'ontime' | 'late' | null;

interface User {
    id: number;
    name: string;
    email: string;
    image: string | null;
}

export interface DataAttendance {
    userId: number;
    user: User;
    date: string; // "yyyy-mm-dd"
    in: {
        id: number | null;
        time: string | null; // "hh:mm"
        status: AttendanceStatus;
    };
    out: {
        id: number | null;
        time: string | null; // "hh:mm"
        status: AttendanceStatus;
    };
}

interface Props {
    dataAttendances: DataAttendance[];
    attendanceKey: string;
}

export default function AbsensiKaryawan({
    dataAttendances: rawDataAttendances,
    attendanceKey,
}: Props) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth?.user?.role === 'superadmin';
    const dataAttendances = isSuperAdmin
        ? rawDataAttendances
        : rawDataAttendances.filter((d) => d.user.id === auth?.user?.id);
    // null = semua hari (tidak difilter)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const filtered = useMemo(() => {
        if (!selectedDate) return dataAttendances;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        return dataAttendances.filter((d) => d.date === dateStr);
    }, [dataAttendances, selectedDate]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Absensi Karyawan" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <ShowAttendance attendanceKey={attendanceKey} />
                <ScanCameraAttendance />
                <Card className="flex h-[min(100%,80vh)] flex-1 flex-col">
                    <CardHeader className="flex flex-col gap-3 space-y-0">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="text-base font-semibold">
                                Absensi Karyawan
                            </div>
                            <DateFilter
                                selectedDate={selectedDate}
                                onChange={setSelectedDate}
                            />
                        </div>

                        <ShowTable<DataAttendance>
                            table={<AbsensiTable />}
                            data={filtered}
                            pageSize={10}
                            placeholder="Cari nama atau email…"
                            predicate={(row: DataAttendance, q: string) => {
                                const hay =
                                    `${row.user.name} ${row.user.email}`.toLowerCase();
                                return hay.includes(q.toLowerCase());
                            }}
                            // opsional: keys masih bisa dipakai untuk field sederhana
                            keys={['date']}
                        />
                    </CardHeader>
                </Card>
            </div>
        </AppLayout>
    );
}
