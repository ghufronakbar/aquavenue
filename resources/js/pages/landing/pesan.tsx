import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { formatIdr } from '@/lib/helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { format, isSameDay, startOfToday } from 'date-fns';

import {
    CalendarIcon,
    MinusIcon,
    PersonStandingIcon,
    PlusIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import LandingLayout from './landing-layout';

interface Props {
    facilities: Facility[];
    poolPrice: number;
}
const HOURS_START = 8;
const HOURS_END = 21;

export default function PesanPage({ facilities, poolPrice }: Props) {
    const [checkouting, setCheckouting] = useState(false);
    const [maxPoolCapacity, setMaxPoolCapacity] = useState(0);
    const orderSchema = z.object({
        date: z.string().min(1, { message: 'Tanggal harus diisi' }),
        amount: z.coerce
            .number()
            .min(1, { message: 'Jumlah harus diisi' })
            .max(maxPoolCapacity, {
                message: `Jumlah tidak boleh melebihi ${maxPoolCapacity}`,
            }),
        time: z.coerce
            .number()
            .min(8, { message: 'Min 08' })
            .max(21, { message: 'Max 21' }),
        extra_facilities: z
            .array(
                z.object({
                    facility_id: z.number().min(1),
                    quantity: z.number().min(1),
                }),
            )
            .default([]),
    });

    type OrderSchema = z.infer<typeof orderSchema>;

    const defaultOrderSchema: OrderSchema = {
        date: '',
        amount: 1,
        time: 8,
        extra_facilities: [],
    };
    const form = useForm({
        resolver: zodResolver(orderSchema),
        defaultValues: defaultOrderSchema,
    });

    const values = form.watch(); // seluruh nilai form

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchResultCheck(); // pakai nilai terbaru dari form.getValues()
        }, 300); // debounce 300ms biar gak spam

        return () => clearTimeout(handler);
    }, [values.date, values.time]);

    const fetchResultCheck = async () => {
        try {
            const token = (
                document.querySelector(
                    'meta[name="csrf-token"]',
                ) as HTMLMetaElement
            )?.content;

            const formattedDate = values.date
                ? format(new Date(values.date), 'yyyy-MM-dd')
                : '';
            const payload = {
                date: formattedDate,
                time: values.time,
            };

            const res = await fetch('/pesan/check-pool-capacity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token ?? '',
                },
                credentials: 'same-origin', // pastikan cookie sesi ikut
                body: JSON.stringify(payload),
            });

            const data = (await res.json()) as {
                data: number;
                message: string;
            }; // backend kamu sudah balikin JSON (200/400)
            // toast.success(`payload: ${JSON.stringify(payload)}, response: ${JSON.stringify(data)}`);

            // Normalisasi bentuk data fasilitas (lihat bagian C)
            setMaxPoolCapacity(data.data);
        } catch (e) {
            console.error(e);
            toast.error('Gagal terhubung ke server');
        }
    };

    const extraFacilitiesArray = useFieldArray({
        control: form.control,
        name: 'extra_facilities',
    });

    // Gunakan watch agar ringkasan re-render
    const watchDate = form.watch('date');
    const watchTime = form.watch('time');
    const watchExtras = form.watch('extra_facilities');

    const handleAddExtraFacility = (facility: Facility) => {
        const facilityId = Number(facility.id);
        const stock = Number(facility.available_stock);
        if (stock <= 0) return;

        const extras = [...(form.getValues('extra_facilities') ?? [])];
        const idx = extras.findIndex(
            (x) => Number(x.facility_id) === facilityId,
        );

        if (idx >= 0) {
            const nextQty = Math.min(stock, Number(extras[idx].quantity) + 1);
            extras[idx] = { ...extras[idx], quantity: nextQty };
        } else {
            extras.push({ facility_id: facilityId, quantity: 1 });
        }
        form.setValue('extra_facilities', extras, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const handleRemoveExtraFacility = (facility: Facility) => {
        const facilityId = Number(facility.id);
        const extras = [...(form.getValues('extra_facilities') ?? [])];
        const idx = extras.findIndex(
            (x) => Number(x.facility_id) === facilityId,
        );
        if (idx < 0) return;

        const nextQty = Number(extras[idx].quantity) - 1;
        if (nextQty <= 0) extras.splice(idx, 1);
        else extras[idx] = { ...extras[idx], quantity: nextQty };

        form.setValue('extra_facilities', extras, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const onSubmit = (data: OrderSchema) => {
        try {
            setCheckouting(true);
            // ambil CSRF token dari meta (aman untuk fetch/axios)

            const token = (
                document.querySelector(
                    'meta[name="csrf-token"]',
                ) as HTMLMetaElement
            )?.content;

            router.post(
                '/pesan',
                { ...data, _token: token }, // lampirkan token jika belum set global
                {
                    preserveScroll: true,
                    onError: (errs) => {
                        // mapping error server -> RHF agar tampil di <FormMessage />
                        Object.entries(errs).forEach(([k, v]) => {
                            // RHF butuh name persis
                            // @ts-expect-error: biarkan fleksibel
                            form.setError(k, {
                                type: 'server',
                                message: String(v),
                            });
                        });
                    },
                },
            );
        } catch (error) {
            toast.error('Gagal memesan');
            console.error(error);
        } finally {
            setCheckouting(false);
        }
    };

    const availableHours = useMemo(() => {
        const today = new Date();
        const selected = watchDate ? new Date(watchDate) : null;

        // default: 08..21
        let minHour = HOURS_START;

        // jika yang dipilih adalah hari ini ⇒ mulai dari jam sekarang + 1
        if (selected && isSameDay(selected, today)) {
            const nextHour = today.getHours() + 1;
            minHour = Math.min(HOURS_END, Math.max(HOURS_START, nextHour));
        }

        // kalau sudah lewat semua slot (misal sudah >21), hasilkan array kosong
        if (minHour > HOURS_END) return [];

        return Array.from(
            { length: HOURS_END - minHour + 1 },
            (_, i) => minHour + i,
        );
    }, [watchDate]);

    const subTotal = useMemo(() => {
        let total = 0;
        for (const extra of watchExtras ?? []) {
            const facility = facilities.find((f) => f.id === extra.facility_id);
            total += (facility?.facility_price ?? 0) * extra.quantity;
        }
        total += poolPrice * Number(form.watch('amount') || 0);
        return total;
    }, [watchExtras, facilities, form.watch('amount'), poolPrice]);

    const tax = useMemo(() => {
        return subTotal * 0.1;
    }, [subTotal]);
    const total = useMemo(() => {
        return subTotal + tax;
    }, [subTotal, tax]);

    return (
        <LandingLayout className="px-4 py-8 md:px-10 lg:px-12 xl:px-16">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-8 lg:flex-row"
                >
                    <div className="flex w-full flex-col gap-8 lg:w-2/3">
                        {/* Tanggal & Waktu */}
                        <Card>
                            <CardContent className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex flex-row items-center gap-2">
                                        <CalendarIcon />
                                        <span className="font-medium">
                                            Pilih Jadwal
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        Pilih tanggal dan waktu kunjungan Anda
                                    </span>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {/* Tanggal */}
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Tanggal</FormLabel>
                                                <FormControl>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                data-empty={
                                                                    !field.value
                                                                }
                                                                className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                                                                type="button"
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {field.value ? (
                                                                    format(
                                                                        new Date(
                                                                            field.value,
                                                                        ),
                                                                        'PPP',
                                                                    )
                                                                ) : (
                                                                    <span>
                                                                        Pilih
                                                                        tanggal
                                                                    </span>
                                                                )}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                                disabled={(
                                                                    date,
                                                                ) =>
                                                                    date <
                                                                    startOfToday()
                                                                }
                                                                // disabledDates={[
                                                                //     new Date(),
                                                                // ]}
                                                                mode="single"
                                                                selected={
                                                                    field.value
                                                                        ? new Date(
                                                                              field.value,
                                                                          )
                                                                        : undefined
                                                                }
                                                                onSelect={(
                                                                    date,
                                                                ) => {
                                                                    field.onChange(
                                                                        date?.toISOString() ??
                                                                            '',
                                                                    );
                                                                    form.setValue(
                                                                        'amount',
                                                                        1,
                                                                    );
                                                                }}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        {/* Jumlah */}
                                        <FormField
                                            control={form.control}
                                            name="amount"
                                            render={({ field }) => (
                                                <FormItem className="h-fit w-full">
                                                    <FormLabel>
                                                        Jumlah
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            step={1}
                                                            inputMode="numeric"
                                                            disabled={
                                                                maxPoolCapacity <=
                                                                0
                                                            }
                                                            {...field}
                                                            value={
                                                                field.value ===
                                                                ''
                                                                    ? ''
                                                                    : String(
                                                                          field.value ??
                                                                              '',
                                                                      )
                                                            }
                                                            onChange={(e) => {
                                                                if (
                                                                    e.target
                                                                        .value ===
                                                                    ''
                                                                )
                                                                    return field.onChange(
                                                                        '',
                                                                    );
                                                                const n =
                                                                    e.target
                                                                        .valueAsNumber;
                                                                if (
                                                                    Number.isNaN(
                                                                        n,
                                                                    )
                                                                )
                                                                    return;
                                                                field.onChange(
                                                                    n,
                                                                );
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    [
                                                                        'e',
                                                                        'E',
                                                                        '+',
                                                                        '-',
                                                                        '.',
                                                                    ].includes(
                                                                        e.key,
                                                                    )
                                                                )
                                                                    e.preventDefault();
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        {!form.watch('date') ||
                                                        !form.watch('time')
                                                            ? 'Harap pilih tanggal dan waktu'
                                                            : maxPoolCapacity
                                                              ? `Stok tersedia: ${maxPoolCapacity}`
                                                              : 'Tidak ada stok'}
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Waktu */}
                                        <FormField
                                            control={form.control}
                                            name="time"
                                            render={({ field }) => (
                                                <FormItem className="h-fit w-full">
                                                    <FormLabel>Waktu</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={(
                                                                value,
                                                            ) => {
                                                                field.onChange(
                                                                    Number(
                                                                        value,
                                                                    ),
                                                                );
                                                                form.setValue(
                                                                    'amount',
                                                                    1,
                                                                );
                                                            }}
                                                            value={
                                                                field.value?.toString() ??
                                                                ''
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih waktu" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableHours.map(
                                                                    (i) => (
                                                                        <SelectItem
                                                                            key={
                                                                                i
                                                                            }
                                                                            value={i.toString()}
                                                                        >
                                                                            {i
                                                                                .toString()
                                                                                .padStart(
                                                                                    2,
                                                                                    '0',
                                                                                )}
                                                                            :00
                                                                            WIB
                                                                            -{' '}
                                                                            {(
                                                                                i +
                                                                                1
                                                                            )
                                                                                .toString()
                                                                                .padStart(
                                                                                    2,
                                                                                    '0',
                                                                                )}
                                                                            :00
                                                                            WIB
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Fasilitas Tambahan */}
                        <Card>
                            <CardContent className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex flex-row items-center gap-2">
                                        <PersonStandingIcon />
                                        <span className="font-medium">
                                            Pilih Fasilitas Tambahan
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        Pilih fasilitas yang ingin Anda gunakan
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {facilities.map((item) => {
                                        const found = (watchExtras ?? []).find(
                                            (x) =>
                                                Number(x.facility_id) ===
                                                Number(item.id),
                                        );
                                        const qty = found?.quantity ?? 0;
                                        return (
                                            <Card key={item.id}>
                                                <CardContent className="flex h-full flex-col gap-4">
                                                    <img
                                                        src={
                                                            item.facility_image ||
                                                            '/placeholder.svg'
                                                        }
                                                        alt={item.facility_name}
                                                        className="aspect-video h-auto w-full rounded-md object-cover"
                                                    />
                                                    <div className="flex flex-col">
                                                        <h3 className="text-lg font-semibold">
                                                            {item.facility_name}
                                                        </h3>
                                                        <p className="line-clamp-2 text-sm text-gray-500">
                                                            {
                                                                item.facility_description
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="mt-auto flex flex-col gap-2">
                                                        <div className="text-sm font-semibold text-primary">
                                                            {formatIdr(
                                                                item.facility_price,
                                                            )}
                                                        </div>
                                                        <div className="flex flex-row items-center gap-2 text-sm text-gray-500">
                                                            <span>
                                                                {`Stok: ${item.available_stock}`}
                                                            </span>
                                                            {item.facility_type ===
                                                            'sell' ? null : (
                                                                <Badge variant="outline">
                                                                    Sewa
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveExtraFacility(
                                                                        item,
                                                                    )
                                                                }
                                                            >
                                                                <MinusIcon className="h-4 w-4" />
                                                            </Button>

                                                            <Input
                                                                type="number"
                                                                className="w-14 text-center"
                                                                value={qty}
                                                                disabled
                                                                readOnly
                                                            />
                                                            <Button
                                                                variant="outline"
                                                                type="button"
                                                                onClick={() =>
                                                                    handleAddExtraFacility(
                                                                        item,
                                                                    )
                                                                }
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Ringkasan */}
                    <div className="sticky top-24 flex h-fit w-full flex-col gap-8 lg:w-1/3">
                        <Card>
                            <CardContent className="flex flex-col gap-4 p-4">
                                <span className="text-2xl font-bold">
                                    Ringkasan Pesanan
                                </span>

                                {/* Waktu */}
                                <div className="flex flex-col">
                                    <span className="font-medium">
                                        Tanggal dan Waktu
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {watchDate
                                            ? format(new Date(watchDate), 'PPP')
                                            : '-'}
                                    </span>
                                    <div className="flex flex-row items-center justify-between gap-2">
                                        <span className="text-sm text-gray-500">
                                            {watchTime
                                                ? `${watchTime.toString().padStart(2, '0')}:00 WIB`
                                                : '-'}{' '}
                                            x{' '}
                                            {form.watch('amount')
                                                ? `${form.watch('amount')}`
                                                : '-'}
                                        </span>
                                        <span className="text-sm font-semibold">
                                            {formatIdr(
                                                poolPrice *
                                                    Number(
                                                        form.watch('amount') ||
                                                            0,
                                                    ),
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Fasilitas tambahan ringkasan */}
                                {(watchExtras?.length || 0) > 0 && (
                                    <>
                                        <Separator />
                                        <div className="flex flex-col gap-2">
                                            <span className="font-medium">
                                                Fasilitas Tambahan
                                            </span>
                                            <div className="flex flex-col gap-1">
                                                {extraFacilitiesArray.fields?.map(
                                                    (it) => {
                                                        const f =
                                                            facilities.find(
                                                                (f) =>
                                                                    Number(
                                                                        f.id,
                                                                    ) ===
                                                                    Number(
                                                                        it.facility_id,
                                                                    ),
                                                            );
                                                        if (!f) return null;
                                                        const sub =
                                                            f.facility_price *
                                                            it.quantity;
                                                        return (
                                                            <div
                                                                key={
                                                                    it.facility_id
                                                                }
                                                                className="flex items-center justify-between text-sm text-gray-600"
                                                            >
                                                                <span>
                                                                    {
                                                                        f.facility_name
                                                                    }{' '}
                                                                    —{' '}
                                                                    {
                                                                        it.quantity
                                                                    }{' '}
                                                                    x{' '}
                                                                    {formatIdr(
                                                                        f.facility_price,
                                                                    )}
                                                                </span>
                                                                <span className="font-semibold text-gray-900">
                                                                    {formatIdr(
                                                                        sub,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <Separator />

                                {/* Total */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">
                                        Sub Total
                                    </span>
                                    <span className="text-sm font-bold">
                                        {formatIdr(subTotal)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">
                                        Pajak (10%)
                                    </span>
                                    <span className="text-sm font-bold">
                                        {formatIdr(tax)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">
                                        Total
                                    </span>
                                    <span className="text-lg font-bold">
                                        {formatIdr(total)}
                                    </span>
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-2"
                                    disabled={checkouting}
                                >
                                    {checkouting ? 'Memesan...' : 'Pesan'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </Form>
            <Toaster richColors position="top-right" duration={2000} />
        </LandingLayout>
    );
}

interface Facility {
    id: number;
    facility_name: string;
    facility_description: string;
    facility_image: string | null;
    facility_price: number;
    available_stock: number;
    facility_type: 'sell' | 'rent';
}
