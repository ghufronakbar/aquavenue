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
} from '@/routes';
import pesan from '@/routes/pesan';
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
    const roles = auth?.user?.role;
    const rawNavItems: NavGroup[] = [
        {
            title: 'Dashboard',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutGrid,
                    roles: ['superadmin', 'admin', 'user'],
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
                    roles: ['superadmin', 'admin'],
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
                    roles: ['superadmin'],
                },
                {
                    title: 'Karyawan',
                    href: managementKaryawan(),
                    icon: User,
                    roles: ['superadmin'],
                },
                {
                    title: 'Fasilitas',
                    href: managementFasilitas(),
                    icon: Building2,
                    roles: ['superadmin'],
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
                    href: pesan.riwayatPesanan(),
                    icon: BookOpen,
                    roles: ['superadmin', 'admin', 'user'],
                },
            ],
        },
    ];

    const mainNavItems = rawNavItems
        .map((item) => ({
            ...item,
            items: item.items.filter((item) =>
                item.roles.includes(roles as 'superadmin' | 'admin' | 'user'),
            ),
        }))
        .filter((item) => item.items.length > 0);

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
