import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatIdr } from '@/lib/helper';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
    Bar,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useDashboard } from '../dashboard-context';
import { useVisible } from '../use-visible';

interface Props {
    className?: string;
}

export const DashboardChartTrend = ({ className }: Props) => {
    const { data } = useDashboard();
    const { role } = useVisible();
    const dataChartTrend =
        role === 'superadmin'
            ? data.chart.trend
            : data.chart.trend.map((item) => ({
                  date: item.date,
                  orders: item.orders,
              }));

    const title =
        role === 'superadmin' ? 'Tren Pesanan & Pendapatan' : 'Tren Pesanan';
    return (
        <Card className={cn(className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={dataChartTrend}>
                            <XAxis
                                dataKey="date"
                                tickFormatter={(d) =>
                                    format(new Date(d), 'dd/MM')
                                }
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                yAxisId="left"
                                tick={{ fontSize: 12 }}
                                tickCount={5}
                                allowDecimals={false}
                                width={28}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(v) =>
                                    v >= 1_000_000
                                        ? `${Math.round(v / 1_000_000)}jt`
                                        : v.toString()
                                }
                                width={40}
                            />
                            <Tooltip
                                formatter={(val: number, name: string) =>
                                    name === 'Pendapatan' ? formatIdr(val) : val
                                }
                                labelFormatter={(d) =>
                                    format(new Date(d), 'EEE, dd MMM yyyy')
                                }
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar
                                yAxisId="left"
                                dataKey="orders"
                                name="Pesanan"
                                barSize={22}
                            />
                            {role === 'superadmin' && (
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Pendapatan"
                                    dot={false}
                                />
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
