import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type FlashBag = {
    success?: string | null;
    error?: string | null;
    status?: string | null;
    timestamp?: string | null;
};

export default function FlashToasts() {
    const { flash } = usePage().props as { flash?: FlashBag };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.status) {
            toast.info(flash.status);
        }
    }, [flash?.success, flash?.error, flash?.status, flash?.timestamp]);

    return null;
}
