import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDashboard } from './dashboard-context';
import { cn } from '@/lib/utils';

interface Props {
    className?: string;
}

export const DashboardUtilization = ({ className }: Props) => {
    const { data } = useDashboard();
    const { potential, booked } = data.utilization;
    const utilization = Math.min(
        100,
        Math.round(
            (booked / potential) * 100,
        ),
    );
    return (
        <Card className={cn(className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">
                    Utilisasi Kolam
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between gap-4">
                    <div className="w-full">
                        <Progress value={utilization} className="h-3" />
                    </div>
                    <div className="min-w-[88px] text-right text-sm font-medium">
                        {booked}/{potential} ({isNaN(utilization) ? '0' : utilization}%)
                    </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    Perkiraan berdasarkan jumlah booking terkonfirmasi untuk
                    slot aktif.
                </p>
            </CardContent>
        </Card>
    );
};
