import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatIdr, initialsFromName } from '@/lib/helper';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useDashboard } from './dashboard-context';
import { useVisible } from './use-visible';

interface Props {
    className?: string;
}

export const DashboardRecentOrder = ({ className }: Props) => {
    const { data } = useDashboard();
    const { role } = useVisible();

    return (
        <Card className={cn(className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Pesanan Terbaru</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <ScrollArea className="h-full w-full">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                {role !== 'user' && (
                                    <TableHead>Order / Pengguna</TableHead>
                                )}
                                <TableHead>Tanggal Reservasi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                                <TableHead>Dipesan Pada</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.recentOrders.map((r) => (
                                <TableRow key={r.id}>
                                    {role !== 'user' && (
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src={
                                                            r.user.image ??
                                                            undefined
                                                        }
                                                        alt={r.user.name}
                                                    />
                                                    <AvatarFallback>
                                                        {initialsFromName(
                                                            r.user.name,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="-mt-8 ml-11 flex min-w-0 flex-col">
                                                <span className="font-medium">
                                                    {r.user.name}
                                                </span>
                                                <span className="truncate text-xs text-muted-foreground">
                                                    {r.user.email}
                                                </span>
                                                <span className="mt-1 font-mono text-xs text-muted-foreground">
                                                    ID: {r.id}
                                                </span>
                                            </div>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>
                                                {format(
                                                    new Date(r.bookedDate),
                                                    'dd MMM yyyy',
                                                )}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {String(r.bookedHour).padStart(
                                                    2,
                                                    '0',
                                                )}
                                                :00 WIB
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={r.status} />
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {formatIdr(r.total)}
                                    </TableCell>
                                    <TableCell>
                                        {format(
                                            new Date(r.created_at),
                                            'dd MMM yyyy HH:mm',
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {data.recentOrders.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        Tidak ada data.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

function StatusBadge({
    status,
}: {
    status: 'pending' | 'confirmed' | 'cancelled';
}) {
    const s = (status || '').toLowerCase() as typeof status;
    if (s === 'confirmed') return <Badge> Dibayar </Badge>;
    if (s === 'pending') return <Badge variant="secondary"> Menunggu </Badge>;
    if (s === 'cancelled')
        return <Badge variant="destructive"> Dibatalkan </Badge>;
    return <Badge variant="outline">{status || '-'}</Badge>;
}
