import FlashToasts from '@/components/custom/flash-toasts';
import { Toaster } from '@/components/ui/sonner';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { useEffect, type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const appearance = localStorage.getItem('appearance');
            if (appearance !== 'light') {
                localStorage.setItem('appearance', 'light');
            }
        }
    }, []);
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <FlashToasts />
            <Toaster
                richColors
                position="top-right"
                duration={2000}
                theme="light"
            />
        </AppLayoutTemplate>
    );
};
