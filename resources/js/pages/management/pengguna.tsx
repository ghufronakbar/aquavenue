import { useSearchPagination } from '@/components/search/search-pagination-provider';
import { ShowTable } from '@/components/search/show-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { initialsFromName } from '@/lib/helper';
import { dashboard, managementPengguna } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Manajemen Pengguna', href: managementPengguna().url },
];

interface DetailUser {
    id: number;
    name: string;
    email: string;
    image: string | null;
    created_at: string;
    orders_count: number;
}

interface Props {
    users: DetailUser[];
}

export default function Pengguna({ users }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pengguna" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card className="flex h-[min(100%,80vh)] flex-1 flex-col">
                    <CardHeader className="flex flex-col gap-3 space-y-0">
                        <div className="text-base font-semibold">
                            Manajemen Pengguna
                        </div>
                        <ShowTable<DetailUser>
                            table={<UsersTable />}
                            data={users}
                            keys={['name', 'email']}
                            placeholder="Cari nama atau email…"
                            pageSize={10}
                        />
                    </CardHeader>
                </Card>
            </div>
        </AppLayout>
    );
}

function UsersTable() {
    const { items } = useSearchPagination<DetailUser>();
    return (
        <ScrollArea className="h-full w-full">
            <Table className="min-w-[720px]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">Pengguna</TableHead>
                        <TableHead className="w-[15%]">Total Pesanan</TableHead>
                        <TableHead className="w-[20%]">Bergabung</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((u) => (
                        <TableRow key={u.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage
                                            src={u.image ?? undefined}
                                            alt={u.name}
                                        />
                                        <AvatarFallback>
                                            {initialsFromName(u.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {u.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {u.email}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{u.orders_count}</TableCell>
                            <TableCell>
                                {format(new Date(u.created_at), 'dd MMM yyyy')}
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
