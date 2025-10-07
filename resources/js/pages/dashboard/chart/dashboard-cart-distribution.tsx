import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboard } from '../dashboard-context';

interface Props {
    className?: string;
}

export const DashboardChartDistribution = ({ className }: Props) => {
    const { data } = useDashboard();
    return (
        <Card className={cn(className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">
                    Distribusi Status Pesanan
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <DashboardOrderStatusDonut
                    data={data.chart.distribution.map((s) => ({
                        name: s.name as 'confirmed' | 'pending' | 'cancelled',
                        value: s.value,
                    }))}
                    total={data.chart.distribution.reduce(
                        (a, b) => a + b.value,
                        0,
                    )}
                />
                <Separator />
                <div className="space-y-2">
                    {data.chart.distribution.map((s) => (
                        <div
                            key={s.name}
                            className="flex items-center justify-between text-sm"
                        >
                            <span className="capitalize">
                                {labelStatus(
                                    s.name as
                                        | 'confirmed'
                                        | 'pending'
                                        | 'cancelled',
                                )}
                            </span>
                            <Badge
                                variant={badgeVariant(
                                    s.name as
                                        | 'confirmed'
                                        | 'pending'
                                        | 'cancelled',
                                )}
                            >
                                {s.value}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

function badgeVariant(
    s: 'confirmed' | 'pending' | 'cancelled',
): React.ComponentProps<typeof Badge>['variant'] {
    if (s === 'confirmed') return 'default';
    if (s === 'pending') return 'secondary';
    if (s === 'cancelled') return 'destructive';
    return 'outline';
}

function DashboardOrderStatusDonut({
    data,
    total,
}: {
    data: { name: 'confirmed' | 'pending' | 'cancelled'; value: number }[];
    total: number;
}) {
    const COLORS = ['#16a34a', '#6b7280', '#dc2626']; // confirmed, pending, cancelled
    return (
        <div className="flex items-center justify-center">
            <div className="relative h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {data.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={COLORS[i % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(v: number, n: string) => [
                                `${v}`,
                                labelStatus(
                                    n as 'confirmed' | 'pending' | 'cancelled',
                                ),
                            ]}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-content-center">
                    <div className="text-center">
                        <div className="text-xl font-semibold">{total}</div>
                        <div className="text-xs text-muted-foreground">
                            Total
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function labelStatus(s: 'confirmed' | 'pending' | 'cancelled') {
    if (s === 'confirmed') return 'Dibayar';
    if (s === 'pending') return 'Menunggu';
    if (s === 'cancelled') return 'Dibatalkan';
    return s;
}
