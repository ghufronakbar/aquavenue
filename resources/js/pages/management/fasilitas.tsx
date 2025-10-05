import { ImageUploader } from '@/components/custom/image-uploader';
import { useSearchPagination } from '@/components/search/search-pagination-provider';
import { ShowTable } from '@/components/search/show-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { FacilityType, enumFacilityType } from '@/lib/enumFacilityType';
import { formatIdr, initialsFromName } from '@/lib/helper';
import { dashboard, managementFasilitas } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { EditIcon, PlusIcon, Trash2Icon, WarehouseIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Manajemen Fasilitas', href: managementFasilitas().url },
];

interface DetailFasilitas {
    id: number;
    facility_name: string;
    facility_price: number;
    facility_description: string;
    facility_image: string | null;
    facility_type: FacilityType;
    available_stock: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    facilities: DetailFasilitas[];
}

export default function Fasilitas({ facilities }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Fasilitas" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card className="flex h-[min(100%,80vh)] flex-1 flex-col">
                    <CardHeader className="flex flex-col gap-3 space-y-0">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-base font-semibold">
                                Manajemen Fasilitas
                            </div>
                            <AddFacilityDialog />
                        </div>

                        <ShowTable<DetailFasilitas>
                            table={<FasilitasTable />}
                            data={facilities}
                            keys={['facility_name', 'facility_type']}
                            placeholder="Cari nama…"
                            pageSize={10}
                        />
                    </CardHeader>
                </Card>
            </div>
            {/* <FlashToasts /> */}
        </AppLayout>
    );
}

function FasilitasTable() {
    const { items } = useSearchPagination<DetailFasilitas>();
    return (
        <ScrollArea className="h-full w-full">
            <Table className="min-w-[880px]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[36%]">Fasilitas</TableHead>
                        <TableHead className="w-[12%]">Tipe</TableHead>
                        <TableHead className="w-[12%]">Stok</TableHead>
                        <TableHead className="w-[12%]">Harga</TableHead>
                        <TableHead className="w-[12%]">Terakhir Diubah</TableHead>
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
                                            src={u.facility_image ?? undefined}
                                            alt={u.facility_name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback>
                                            {initialsFromName(u.facility_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex min-w-0 flex-col">
                                        <span className="font-medium">
                                            {u.facility_name}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {u.facility_description}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge>
                                    {enumFacilityType.getLabel(u.facility_type)}
                                </Badge>
                            </TableCell>
                            <TableCell>{u.available_stock}</TableCell>
                            <TableCell>{formatIdr(u.facility_price)}</TableCell>
                            <TableCell>
                                {format(new Date(u.created_at), 'dd MMM yyyy')}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-row items-center gap-2">
                                    <EditStockDialog facility={u} />
                                    <EditFacilityDialog facility={u} />
                                    <DeleteFacilityDialog facility={u} />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}

                    {items.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={6}
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
   DIALOG: TAMBAH FASILITAS
   ========================================================================= */
const addSchema = z.object({
    facility_name: z.string().min(1),
    facility_price: z.coerce.number().int().min(0),
    facility_description: z.string().min(1),
    facility_image: z
        .string()
        .url()
        .nullable()
        .or(z.literal(''))
        .transform((v) => v || null),
    facility_type: z.enum(['sell', 'rent']),
    initial_stock: z.coerce.number().int(),
});
type AddSchema = z.infer<typeof addSchema>;

function AddFacilityDialog() {
    const [open, setOpen] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(addSchema),
        defaultValues: {
            facility_name: '',
            facility_price: 0,
            facility_description: '',
            facility_image: null,
            facility_type: 'sell',
            initial_stock: 0,
        },
    });

    const onSubmit = (data: AddSchema) => {
        const token = (
            document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
        )?.content;
        router.post(
            '/management-fasilitas',
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
                    Tambah Fasilitas
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Tambah Fasilitas</DialogTitle>
                    <DialogDescription>
                        Masukkan data fasilitas baru dan stok awalnya.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <Label>Nama</Label>
                            <Input
                                placeholder="cth. Handuk"
                                {...register('facility_name')}
                            />
                            {errors.facility_name && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.facility_name.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>Harga</Label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                onKeyDown={(e) => {
                                    if (e.key === 'e') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }
                                }}
                                {...register('facility_price')}
                            />
                            {errors.facility_price && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.facility_price.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label>Deskripsi</Label>
                        <Textarea
                            rows={3}
                            placeholder="Deskripsi fasilitas…"
                            {...register('facility_description')}
                        />
                        {errors.facility_description && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.facility_description.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <Label>Gambar</Label>
                            <ImageUploader
                                image={watch('facility_image')}
                                setImage={(v) => {
                                    setValue('facility_image', v);
                                }}
                                id="add-facility-image"
                            />
                            {errors.facility_image && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.facility_image.message as string}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Tipe</Label>
                                <Select
                                    onValueChange={(v) =>
                                        register('facility_type').onChange({
                                            target: { value: v },
                                        })
                                    }
                                    defaultValue="sell"
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sell">
                                            Jual
                                        </SelectItem>
                                        <SelectItem value="rent">
                                            Sewa
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <input
                                    type="hidden"
                                    {...register('facility_type')}
                                />
                                {errors.facility_type && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.facility_type.message}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Stok Awal</Label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    {...register('initial_stock')}
                                />
                                {errors.initial_stock && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.initial_stock.message}
                                    </p>
                                )}
                            </div>
                        </div>
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
   DIALOG: EDIT DATA FASILITAS
   ========================================================================= */
const editSchema = z.object({
    id: z.number().int(),
    facility_name: z.string().min(1),
    facility_price: z.coerce.number().int().min(0),
    facility_description: z.string().min(1),
    facility_image: z
        .string()
        .url()
        .nullable()
        .or(z.literal(''))
        .transform((v) => v || null),
    facility_type: z.enum(['sell', 'rent']),
});
type EditSchema = z.infer<typeof editSchema>;

function EditFacilityDialog({ facility }: { facility: DetailFasilitas }) {
    const [open, setOpen] = useState(false);
    const defaultValues = useMemo<EditSchema>(
        () => ({
            id: facility.id,
            facility_name: facility.facility_name,
            facility_price: facility.facility_price,
            facility_description: facility.facility_description,
            facility_image: facility.facility_image ?? null,
            facility_type: facility.facility_type,
        }),
        [facility],
    );

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(editSchema),
        defaultValues,
    });

    const onOpenChange = (o: boolean) => {
        setOpen(o);
        if (o) reset(defaultValues);
    };

    const onSubmit = (data: EditSchema) => {
        const token = (
            document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
        )?.content;
        router.put(
            `/management-fasilitas/${facility.id}`,
            { ...data, _token: token },
            {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" title="Edit fasilitas">
                    <EditIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit Fasilitas</DialogTitle>
                    <DialogDescription>
                        Perbarui data fasilitas.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <input
                        type="hidden"
                        {...register('id', { value: facility.id })}
                    />

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <Label>Nama</Label>
                            <Input {...register('facility_name')} />
                            {errors.facility_name && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.facility_name.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>Harga</Label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                onKeyDown={(e) => {
                                    if (e.key === 'e') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }
                                }}
                                {...register('facility_price')}
                            />
                            {errors.facility_price && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.facility_price.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label>Deskripsi</Label>
                        <Textarea
                            rows={3}
                            {...register('facility_description')}
                        />
                        {errors.facility_description && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.facility_description.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <Label>Gambar</Label>
                            <ImageUploader
                                image={watch('facility_image')}
                                setImage={(v) => {
                                    setValue('facility_image', v);
                                }}
                                id={`edit-facility-image-${facility.id}`}
                            />
                            {errors.facility_image && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.facility_image.message as string}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>Tipe</Label>
                            <Select
                                defaultValue={defaultValues.facility_type}
                                onValueChange={(v) =>
                                    setValue(
                                        'facility_type',
                                        v as 'sell' | 'rent',
                                        { shouldDirty: true },
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sell">Jual</SelectItem>
                                    <SelectItem value="rent">Sewa</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.facility_type && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.facility_type.message}
                                </p>
                            )}
                        </div>
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
   DIALOG: UBAH STOK (TARGET)
   ========================================================================= */
const stockSchema = z.object({
    id: z.number().int(),
    new_amount: z.coerce.number().int(),
});
type StockSchema = z.infer<typeof stockSchema>;

function EditStockDialog({ facility }: { facility: DetailFasilitas }) {
    const [open, setOpen] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(stockSchema),
        defaultValues: {
            id: facility.id,
            new_amount: facility.available_stock,
        },
    });

    const onOpenChange = (o: boolean) => {
        setOpen(o);
        if (o) reset({ id: facility.id, new_amount: facility.available_stock });
    };

    const onSubmit = (data: StockSchema) => {
        const token = (
            document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
        )?.content;
        router.patch(
            `/management-fasilitas/${facility.id}`,
            { ...data, _token: token },
            {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="icon" title="Ubah stok">
                    <WarehouseIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Ubah Stok</DialogTitle>
                    <DialogDescription>
                        Stok saat ini: <b>{facility.available_stock}</b>.
                        Masukkan **stok baru (target)** yang diinginkan.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <input
                        type="hidden"
                        {...register('id', { value: facility.id })}
                    />
                    <div>
                        <Label>Stok Baru (target)</Label>
                        <Input
                            type="number"
                            inputMode="numeric"
                            {...register('new_amount')}
                        />
                        {errors.new_amount && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.new_amount.message}
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
   DIALOG: HAPUS FASILITAS
   ========================================================================= */
function DeleteFacilityDialog({ facility }: { facility: DetailFasilitas }) {
    const [open, setOpen] = useState(false);

    const onDelete = () => {
        const token = (
            document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
        )?.content;
        router.delete(`/management-fasilitas/${facility.id}`, {
            data: { _token: token, id: facility.id },
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
                    title="Hapus fasilitas"
                >
                    <Trash2Icon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Hapus Fasilitas</DialogTitle>
                    <DialogDescription>
                        Yakin ingin menghapus <b>{facility.facility_name}</b>?
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
