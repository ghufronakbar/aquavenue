import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export const useVisible = () => {
    const { auth } = usePage<SharedData>().props;
    const visible = (roles: ('admin' | 'superadmin' | 'user')[]) => {
        if (!auth?.user?.role) return false;
        return roles.includes(auth?.user?.role);
    };
    return { visible, role: auth?.user?.role };
};
