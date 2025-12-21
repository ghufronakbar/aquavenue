import { cn } from '@/lib/utils';
import React from 'react';

export default function AppLogoIcon(
    props: React.HTMLAttributes<HTMLDivElement>,
) {
    return (
        <div {...props} className={cn('font-bold text-white', props.className)}>
            PW
        </div>
    );
    // return <DropletIcon {...props} />;
}
