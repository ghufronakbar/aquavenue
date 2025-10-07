import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, Users2 } from 'lucide-react';
import { useDashboard } from '../dashboard-context';

interface Props {
    className?: string;
}

export const DashboardKpiCustomer = ({ className }: Props) => {
    const { data, date } = useDashboard();
    const { delta, up, value } = data.kpi.customer;

    return (
        <Card className={cn(className)}>
            <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-xl border p-2">
                    <Users2 className="h-5 w-5" />
                </div>
                <div className="flex flex-1 flex-col">
                    <span className="text-xs text-muted-foreground">
                        Pelanggan
                    </span>
                    <div className="flex flex-row items-end">
                        <span className="text-xl font-semibold">{value}</span>
                        {delta !== null && (
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1 text-xs',
                                    up ? 'text-emerald-600' : 'text-red-600',
                                )}
                                title={
                                    up
                                        ? 'Naik dibanding periode sebelumnya'
                                        : 'Turun dibanding periode sebelumnya'
                                }
                            >
                                {up ? (
                                    <ArrowUpRight className="h-4 w-4" />
                                ) : (
                                    <ArrowDownRight className="h-4 w-4" />
                                )}
                                {delta}%
                            </span>
                        )}
                    </div>
                    {typeof date.difference === 'number' &&
                        date.difference > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {date.difference === 1
                                    ? 'dibanding kemarin'
                                    : `${date.difference} hari sebelumnya`}
                            </span>
                        )}
                </div>
            </CardContent>
        </Card>
    );
};
