// resources/js/Pages/management/karyawan.tsx
import { useSearchPagination } from '@/components/search/search-pagination-provider';
import { ShowTable } from '@/components/search/show-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { dashboard, managementKaryawan } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Manajemen Karyawan', href: managementKaryawan().url },
];

interface DetailKaryawan {
    id: number;
    name: string;
    email: string;
    image: string | null;
    created_at: string;
}

interface Props {
    users: DetailKaryawan[];
}

export default function Karyawan({ users }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Karyawan" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card className="flex h-[min(100%,80vh)] flex-1 flex-col">
                    <CardHeader className="flex flex-col gap-3 space-y-0">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-base font-semibold">
                                Manajemen Karyawan
                            </div>
                            <AddKaryawanDialog />
                        </div>

                        <ShowTable<DetailKaryawan>
                            table={<KaryawanTable />}
                            data={users}
                            keys={['name', 'email']}
                            placeholder="Cari nama atau email…"
                            pageSize={10}
                        />
                    </CardHeader>
                </Card>
            </div>
            {/* <FlashToasts />  // pakai ini kalau kamu sudah buat komponen flash toast */}
        </AppLayout>
    );
}

function KaryawanTable() {
    const { items } = useSearchPagination<DetailKaryawan>();
    return (
        <ScrollArea className="h-full w-full">
            <Table className="min-w-[780px]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[48%]">Karyawan</TableHead>
                        <TableHead className="w-[18%]">Bergabung</TableHead>
                        <TableHead className="w-[16%]"></TableHead>
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
                                    <div className="flex min-w-0 flex-col">
                                        <span className="font-medium">
                                            {u.name}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {u.email}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {format(new Date(u.created_at), 'dd MMM yyyy')}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-row items-center gap-2">
                                    <DeleteKaryawanDialog user={u} />
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

/* =========================================================================
   DIALOG: TAMBAH KARYAWAN
   ========================================================================= */
const addSchema = z.object({
    name: z.string().min(1, 'Nama wajib diisi'),
    email: z.string().email('Email tidak valid'),
});
type AddSchema = z.infer<typeof addSchema>;

function AddKaryawanDialog() {
    const [open, setOpen] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AddSchema>({
        resolver: zodResolver(addSchema),
        defaultValues: { name: '', email: '' },
    });

    const onSubmit = (data: AddSchema) => {
        const token = (
            document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
        )?.content;
        router.post(
            '/management-karyawan',
            { ...data, _token: token },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    reset();
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Tambah Karyawan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambah Karyawan</DialogTitle>
                    <DialogDescription>
                        Masukkan nama & email untuk membuat akun karyawan baru.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <Label>Nama</Label>
                        <Input
                            placeholder="cth. Budi Santoso"
                            {...register('name')}
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.name.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input
                            placeholder="nama@contoh.com"
                            {...register('email')}
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan…' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* =========================================================================
   DIALOG: HAPUS KARYAWAN
   ========================================================================= */
function DeleteKaryawanDialog({ user }: { user: DetailKaryawan }) {
    const [open, setOpen] = useState(false);

    const onDelete = () => {
        const token = (
            document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
        )?.content;
        router.delete(`/management-karyawan/${user.id}`, {
            data: { _token: token, id: user.id },
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="icon"
                    title="Hapus karyawan"
                >
                    <Trash2Icon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Hapus Karyawan</DialogTitle>
                    <DialogDescription>
                        Yakin ingin menghapus <b>{user.name}</b> ({user.email})?
                        Tindakan ini akan melakukan soft delete.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Batal
                    </Button>
                    <Button variant="destructive" onClick={onDelete}>
                        Hapus
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
