import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user?: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    roles: ('superadmin' | 'admin' | 'user')[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth?: Auth;
    sidebarOpen: boolean;
    flash?: {
        success?: string;
        error?: string;
        status?: string;
        timestamp?: string;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    image?: string | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    role: 'superadmin' | 'admin' | 'user';
    [key: string]: unknown; // This allows for additional properties...
}
