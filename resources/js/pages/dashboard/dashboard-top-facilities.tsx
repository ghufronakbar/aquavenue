import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatIdr } from '@/lib/helper';
import { cn } from '@/lib/utils';
import { useDashboard } from './dashboard-context';
import { useVisible } from './use-visible';

interface Props {
    className?: string;
}

export const DashboardTopFacilities = ({ className }: Props) => {
    const { data } = useDashboard();
    const { role } = useVisible();

    const targetMax =
        data.topFacilities.sort((a, b) => b.sold - a.sold)?.[0]?.sold ?? 0;

    const isAdmin = role !== 'user';

    const title = isAdmin ? 'Fasilitas Teratas' : 'Fasilitas Paling Sering Dipesan';
    
    return (
        <Card className={cn(className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <div className="px-4">
                    <div className="space-y-4">
                        {data.topFacilities.map((r, i) => {
                            const pct =
                                Math.min(
                                    100,
                                    Math.round((r.sold / targetMax) * 100),
                                ) ?? 0;
                            return (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">
                                            {r.name}
                                        </span>
                                        <span className="tabular-nums">
                                            {r.sold}
                                        </span>
                                    </div>
                                    <Progress value={pct} className="h-2" />
                                    <div className="text-xs text-muted-foreground">
                                        {isAdmin ? 'Pendapatan' : 'Total'}{' '}
                                        {formatIdr(r.revenue)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {data.topFacilities.length === 0 && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            Tidak ada data.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
