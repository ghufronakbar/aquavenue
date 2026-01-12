import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useDashboard } from './dashboard-context';
import { useVisible } from './use-visible';

export const DashboardHeader = () => {
    const { role } = useVisible();
    const { poolInformation } = useDashboard();
    return (
        <Card>
            <CardHeader className="flex flex-row flex-wrap justify-between gap-3 space-y-0">
                <div>
                    <CardTitle>Ringkasan Data</CardTitle>
                    <CardDescription>
                        Pilih tanggal dan periode untuk melihat ringkasan data.
                    </CardDescription>
                </div>
                <div>
                    <div className="flex flex-col items-center gap-2">
                        <DateRangeFilter />
                        {role === 'superadmin' && (
                            <Button
                                onClick={() => poolInformation.setIsOpen(true)}
                                className="w-full"
                            >
                                Informasi Kolam
                            </Button>
                        )}
                    </div>
                    <PoolInformationDialog />
                </div>
            </CardHeader>
        </Card>
    );
};

function DateRangeFilter() {
    const { date } = useDashboard();
    const label = (() => {
        if (!date.value?.from && !date.value?.to) return 'Semua tanggal';
        if (
            date.value.from &&
            date.value.to &&
            date?.value?.from.toDateString() === date?.value?.to.toDateString()
        )
            return `${format(date.value.from, 'dd MMM yyyy')}`;
        if (date.value?.from && !date.value?.to)
            return `${format(date.value.from, 'dd MMM yyyy')}`;
        if (date.value?.from && date.value?.to)
            return `${format(date.value.from, 'dd MMM yyyy')} — ${format(date.value.to, 'dd MMM yyyy')}`;
        return 'Semua tanggal';
    })();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                >
                    <CalendarIcon className="h-4 w-4" />
                    {label}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Pilih Rentang</Label>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => date.setValue(undefined)}
                        >
                            Semua
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                const today = new Date();
                                date.setValue({ from: today, to: today });
                            }}
                        >
                            Hari ini
                        </Button>
                    </div>
                </div>
                <div className="mt-2 rounded-md border">
                    <Calendar
                        mode="range"
                        numberOfMonths={2}
                        selected={date.value}
                        onSelect={(r) => date.setValue(r)}
                        initialFocus
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}

const PoolInformationDialog = () => {
    const { poolInformation } = useDashboard();
    return (
        <Dialog
            open={poolInformation.isOpen}
            onOpenChange={poolInformation.setIsOpen}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Informasi Kolam</DialogTitle>
                    <DialogDescription>
                        Terakhir diubah:{' '}
                        {poolInformation.value.updated_at
                            ? format(
                                new Date(poolInformation.value.updated_at),
                                'dd MMM yyyy HH:mm',
                            )
                            : '-'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...poolInformation.form}>
                    <form
                        onSubmit={poolInformation.form.handleSubmit(
                            poolInformation.onSubmit,
                        )}
                        className="space-y-4"
                    >
                        <FormField
                            control={poolInformation.form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Harga</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            onKeyDown={(e) =>
                                                e.key === 'e' &&
                                                e.preventDefault()
                                            }
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={poolInformation.form.control}
                            name="capacity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kapasitas Maksimal</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            onKeyDown={(e) =>
                                                e.key === 'e' &&
                                                e.preventDefault()
                                            }
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Simpan</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
