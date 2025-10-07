import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout';
import { useEffect } from 'react';

export default function AuthLayout({
    children,
    title,
    description,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
}) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const apperance = localStorage.getItem('appearance');
            if (apperance !== 'light') {
                localStorage.setItem('appearance', 'light');
            }
        }
    }, []);
    return (
        <AuthLayoutTemplate title={title} description={description} {...props}>
            {children}
        </AuthLayoutTemplate>
    );
}
