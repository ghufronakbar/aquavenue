import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    absensiKaryawan,
    dashboard,
    managementFasilitas,
    managementKaryawan,
    managementPengguna,
    riwayatPesanan,
} from '@/routes';
import { NavGroup, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    ChartColumn,
    LayoutGrid,
    User,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth?.user?.role !== 'user';
    const mainNavItems: NavGroup[] = [
        {
            title: 'Dashboard',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutGrid,
                },
            ],
        },
        {
            title: 'Absensi Karyawan',
            items: [
                {
                    title: 'Absensi Karyawan',
                    href: absensiKaryawan(),
                    icon: ChartColumn,
                },
            ],
        },
        {
            title: 'Management',
            items: [
                {
                    title: 'Pengguna',
                    href: managementPengguna(),
                    icon: User,
                },
                {
                    title: 'Karyawan',
                    href: managementKaryawan(),
                    icon: User,
                },
                {
                    title: 'Fasilitas',
                    href: managementFasilitas(),
                    icon: Building2,
                },
            ],
        },
        {
            title: 'Pesanan',
            items: [
                {
                    title: isAdmin
                        ? 'Kelola Reservasi'
                        : 'Riwayat Pesanan Saya',
                    href: riwayatPesanan(),
                    icon: BookOpen,
                },
            ],
        },
    ];
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {mainNavItems.map((item) => (
                    <NavMain
                        key={item.title}
                        items={item.items}
                        title={item.title}
                    />
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
