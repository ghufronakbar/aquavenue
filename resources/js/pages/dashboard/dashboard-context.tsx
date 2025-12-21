import { router } from '@inertiajs/react';
import { differenceInDays } from 'date-fns';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { UseFormReturn, useForm } from 'react-hook-form';
import { toast } from 'sonner';

// RECENT ORDER
interface RecentOrderRow {
    id: string;
    user: { name: string; email: string; image: string | null };
    total: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    bookedDate: string;
    bookedHour: number;
    created_at: string;
}


// TOP FACILITY
interface TopFacilityRow {
    name: string;
    sold: number;
    revenue: number;
    // type: "sell" | "rent";
}

// UTILIZATION
interface UtilizationRow {
    potential: number; // all capacity
    booked: number; // all booked
}

// KPI
interface DashboardKpi {
    value: number;
    delta: number | null; // null jika tidak ada perbandingan (all date), jika ada percentage
    up: boolean; // jika delta > 0 = true, jika delta <= 0 = false
}

const initialKpi: DashboardKpi = {
    value: 0,
    delta: null,
    up: false,
};

// CHART
// TREND
interface DashboardChartTrendRow {
    date: string; // "yyyy-MM-dd"
    orders: number;
    revenue: number;
}
// DISTRIBUTION
interface DashboardChartDistributionRow {
    name: 'confirmed' | 'pending' | 'cancelled';
    value: number;
}

// POOL INFORMATION
interface PoolInformationRow {
    price: number;
    capacity: number;
    updated_at: string;
}

interface DashboardContextType {
    date: {
        value: DateRange | undefined;
        setValue: (dateRange: DateRange | undefined) => void;
        difference: number | null;
    };
    data: {
        recentOrders: RecentOrderRow[];
        topFacilities: TopFacilityRow[];
        utilization: UtilizationRow;
        kpi: {
            income: DashboardKpi;
            order: DashboardKpi;
            customer: DashboardKpi;
            utilization: DashboardKpi;
        };
        chart: {
            trend: DashboardChartTrendRow[];
            distribution: DashboardChartDistributionRow[];
        };
    };
    poolInformation: {
        value: PoolInformationRow;
        form: UseFormReturn<PoolInformationRow>;
        onSubmit: () => Promise<void>;
        isOpen: boolean;
        setIsOpen: (isOpen: boolean) => void;
    };
}

const DashboardContext = createContext<DashboardContextType | undefined>(
    undefined,
);

export const DashboardProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    // POOL INFORMATION
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<PoolInformationRow>({
        defaultValues: {
            price: 0,
            capacity: 0,
            updated_at: '',
        },
    });
    const onSubmit = async () => {
        const token = (
            document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
        )?.content;
        router.post(
            '/dashboard/pool-information',
            {
                ...form.getValues(),
                _token: token,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsOpen(false);
                    fetchData();
                },
                onError: () => {
                    toast.error('Gagal mengubah informasi kolam');
                },
            },
        );
    };
    const poolInformation: DashboardContextType['poolInformation'] = {
        value: form.getValues(),
        form,
        onSubmit,
        isOpen,
        setIsOpen,
    };
    // FILTER
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    });

    const difference = useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return null;
        return differenceInDays(dateRange.to, dateRange.from) + 1;
    }, [dateRange]);

    const date: DashboardContextType['date'] = {
        value: dateRange,
        setValue: setDateRange,
        difference,
    };

    // STATE DATA
    const [recentOrders, setRecentOrders] = useState<RecentOrderRow[]>([]);
    const [topFacilities, setTopFacilities] = useState<TopFacilityRow[]>([]);
    const [utilization, setUtilization] = useState<UtilizationRow>({
        potential: 0,
        booked: 0,
    });

    // KPI DATA
    const [incomeKpi, setIncomeKpi] = useState<DashboardKpi>(initialKpi);
    const [orderKpi, setOrderKpi] = useState<DashboardKpi>(initialKpi);
    const [customerKpi, setCustomerKpi] = useState<DashboardKpi>(initialKpi);
    const [utilizationKpi, setUtilizationKpi] =
        useState<DashboardKpi>(initialKpi);
    const kpi: DashboardContextType['data']['kpi'] = {
        income: incomeKpi,
        order: orderKpi,
        customer: customerKpi,
        utilization: utilizationKpi,
    };

    // CHART DATA
    const [trend, setTrend] = useState<DashboardChartTrendRow[]>([]);
    const [distribution, setDistribution] = useState<
        DashboardChartDistributionRow[]
    >([]);
    const chart: DashboardContextType['data']['chart'] = {
        trend,
        distribution,
    };

    // MAIN DATA
    const data: DashboardContextType['data'] = {
        recentOrders,
        topFacilities,
        utilization,
        kpi,
        chart,
    };

    const fetchData = async () => {
        const queryParams = new URLSearchParams();
        if (dateRange?.from) {
            queryParams.set('from', dateRange.from.toISOString());
        }
        if (dateRange?.to) {
            queryParams.set('to', dateRange.to.toISOString());
        }
        const response = await fetch(
            `/dashboard/data?${queryParams.toString()}`,
        );
        if (!response.ok) {
            toast.error('Gagal mengambil data');
            console.error(response);
            return;
        }
        const data = (await response.json()) as DashboardContextType['data'] & {
            poolInformation: PoolInformationRow;
        };
        if (data?.recentOrders) {
            setRecentOrders(data.recentOrders);
        }
        if (data?.topFacilities) {
            setTopFacilities(data.topFacilities);
        }
        if (data?.utilization) {
            setUtilization(data.utilization);
        }
        if (data?.kpi) {
            if (data?.kpi?.income) {
                setIncomeKpi(data.kpi.income);
            }
            if (data?.kpi?.order) {
                setOrderKpi(data.kpi.order);
            }
            if (data?.kpi?.customer) {
                setCustomerKpi(data.kpi.customer);
            }
            if (data?.kpi?.utilization) {
                setUtilizationKpi(data.kpi.utilization);
            }
        }
        if (data?.chart) {
            if (data?.chart?.trend) {
                setTrend(data.chart.trend);
            }
            if (data?.chart?.distribution) {
                setDistribution(data.chart.distribution);
            }
        }
        if (data?.poolInformation) {
            form.setValue('price', data?.poolInformation?.price ?? 0);
            form.setValue('capacity', data?.poolInformation?.capacity ?? 0);
            form.setValue(
                'updated_at',
                data?.poolInformation?.updated_at ?? '',
            );
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    return (
        <DashboardContext.Provider
            value={{
                date,
                data,
                poolInformation,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
