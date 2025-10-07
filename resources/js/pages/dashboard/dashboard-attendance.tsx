import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useDashboard } from './dashboard-context';

interface Props {
    className?: string;
}

export const DashboardAttendance = ({ className }: Props) => {
    const { data } = useDashboard();
    return (
        <Card className={cn(className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Kehadiran Admin</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <div className="px-4 h-[320px] overflow-y-auto">
                    <div className="space-y-4">
                        {data.attendance.map((r, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between gap-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex min-w-0 flex-col">
                                        <span className="truncate text-sm font-medium">
                                            {r.date}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="">
                                        <div className="text-xs text-muted-foreground">
                                            On time
                                        </div>
                                        <div className="font-medium tabular-nums">
                                            {r.total_ontime || '-'}
                                        </div>
                                    </div>
                                    <Separator
                                        orientation="vertical"
                                        className="h-8"
                                    />
                                    <div className="">
                                        <div className="text-xs text-muted-foreground">
                                            Terlambat
                                        </div>
                                        <div className="font-medium tabular-nums">
                                            {r.total_late || '-'}
                                        </div>
                                    </div>
                                    <Separator
                                        orientation="vertical"
                                        className="h-8"
                                    />
                                    <div className="">
                                        <div className="text-xs text-muted-foreground">
                                            Belum absen
                                        </div>
                                        <div className="font-medium tabular-nums">
                                            {r.total_not_checked || '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {data.attendance.length === 0 && (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            Belum ada data.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
