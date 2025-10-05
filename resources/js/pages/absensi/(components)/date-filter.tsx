import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

export function DateFilter({
    selectedDate,
    onChange,
}: {
    selectedDate: Date | null;
    onChange: (d: Date | null) => void;
}) {
    const label = selectedDate ? format(selectedDate, 'PPP') : 'Semua hari';
    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {label}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="end">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                            Pilih Hari
                        </Label>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onChange(new Date())}
                            >
                                Hari ini
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onChange(null)}
                            >
                                Semua
                            </Button>
                        </div>
                    </div>
                    <div className="mt-2 rounded-md border">
                        <Calendar
                            mode="single"
                            selected={selectedDate ?? undefined}
                            onSelect={(d) => onChange(d ?? null)}
                            initialFocus
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
