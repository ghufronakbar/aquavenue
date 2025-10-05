import { useSearchPagination } from '@/components/search/search-pagination-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { initialsFromName } from '@/lib/helper';
import { format } from 'date-fns';
import { AttendanceStatus, DataAttendance } from '../absensi-karyawan';

export function AbsensiTable() {
    const { items } = useSearchPagination<DataAttendance>();

    return (
        <ScrollArea className="h-full w-full">
            <Table className="min-w-[880px]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[36%]">Pengguna</TableHead>
                        <TableHead className="w-[16%]">Tanggal</TableHead>
                        <TableHead className="w-[24%]">Absen Masuk</TableHead>
                        <TableHead className="w-[24%]">Absen Pulang</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((r) => (
                        <TableRow key={`${r.userId}-${r.date}`}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage
                                            src={r.user.image ?? undefined}
                                            alt={r.user.name}
                                        />
                                        <AvatarFallback>
                                            {initialsFromName(r.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex min-w-0 flex-col">
                                        <span className="font-medium">
                                            {r.user.name}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {r.user.email}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>

                            {/* Date */}
                            <TableCell className="tabular-nums">
                                {format(new Date(r.date), 'dd MMM yyyy')}
                            </TableCell>

                            {/* IN */}
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium tabular-nums">
                                        {r.in?.time ? `${r.in.time} WIB` : ''}
                                    </span>
                                    <StatusBadge
                                        status={r.in?.status ?? null}
                                    />
                                </div>
                            </TableCell>

                            {/* OUT */}
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium tabular-nums">
                                        {r.out?.time ? `${r.out.time} WIB` : ''}
                                    </span>
                                    <StatusBadge
                                        status={r.out?.status ?? null}
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}

                    {items.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={4}
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

function StatusBadge({ status }: { status: AttendanceStatus }) {
    if (!status) return <Badge variant="outline">Belum absen</Badge>;
    if (status === 'ontime') return <Badge>On time</Badge>;
    if (status === 'late') return <Badge variant="destructive">Late</Badge>;
    return <Badge variant="outline">-</Badge>;
}
