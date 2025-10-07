import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { DashboardChartDistribution } from './chart/dashboard-cart-distribution';
import { DashboardChartTrend } from './chart/dashboard-chart-trend';
import { DashboardAttendance } from './dashboard-attendance';
import { DashboardProvider } from './dashboard-context';
import { DashboardHeader } from './dashboard-header';
import { DashboardRecentOrder } from './dashboard-recent-order';
import { DashboardTopFacilities } from './dashboard-top-facilities';
import { DashboardKpiCustomer } from './kpi/dashboard-kpi-customer';
import { DashboardKpiIncome } from './kpi/dashboard-kpi-income';
import { DashboardKpiOrder } from './kpi/dashboard-kpi-order';
import { DashboardKpiUtilization } from './kpi/dashboard-kpi-utilization';
import { useVisible } from './use-visible';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

export default function Dashboard() {
    const { visible, role } = useVisible();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <DashboardProvider>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-4 p-4">
                    <DashboardHeader />
                    {/* KPI Cards */}
                    {visible(['admin', 'superadmin']) && (
                        <div
                            className={cn(
                                'grid gap-4 md:grid-cols-2 xl:grid-cols-4',
                                role === 'admin'
                                    ? 'md:grid-cols-3 xl:grid-cols-3'
                                    : '',
                            )}
                        >
                            {visible(['superadmin']) && <DashboardKpiIncome />}
                            {visible(['admin', 'superadmin']) && (
                                <DashboardKpiOrder />
                            )}
                            {visible(['admin', 'superadmin']) && (
                                <DashboardKpiCustomer />
                            )}
                            {visible(['admin', 'superadmin']) && (
                                <DashboardKpiUtilization />
                            )}
                        </div>
                    )}

                    {/* Charts Row */}
                    {visible(['admin', 'superadmin']) && (
                        <div className="grid gap-4 lg:grid-cols-3">
                            {visible(['admin', 'superadmin']) && (
                                <DashboardChartTrend className="lg:col-span-2" />
                            )}
                            {visible(['admin', 'superadmin']) && (
                                <DashboardChartDistribution className="" />
                            )}
                        </div>
                    )}

                    {/* Secondary Row */}
                    <div className="flex w-full flex-row gap-4 overflow-hidden">
                        {visible(['admin', 'superadmin', 'user']) && (
                            <DashboardRecentOrder className="w-full md:w-2/3" />
                        )}

                        <div className="flex h-fit w-full flex-col gap-4">
                            {visible(['superadmin']) && (
                                <DashboardAttendance className="h-1/2" />
                            )}
                            {visible(['admin', 'superadmin', 'user']) && (
                                <DashboardTopFacilities className="h-1/2" />
                            )}
                        </div>
                    </div>
                </div>
            </DashboardProvider>
        </AppLayout>
    );
}
