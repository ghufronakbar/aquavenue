import AppLogo from '@/components/app-logo';
import { cn } from '@/lib/utils';
import { dashboard, home, login, testimonial } from '@/routes';
import pesan from '@/routes/pesan';
import { type SharedData } from '@/types';
import { Head, InertiaLinkProps, Link, usePage } from '@inertiajs/react';

interface LandingLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export default function LandingLayout({
    children,
    className,
}: LandingLayoutProps) {
    return (
        <>
            <Head title="Aqua Venue">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <LandingHeader />
                <div className={cn('mt-16 min-h-screen w-full', className)}>
                    {children}
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}

interface HeaderLink {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    isActive?: boolean;
}

const HEADER_LINKS: HeaderLink[] = [
    {
        title: 'Beranda',
        href: home(),
    },
    {
        title: 'Pesan',
        href: pesan.index(),
    },
    {
        title: 'Testimonial',
        href: testimonial(),
    },
];

const LandingHeader = () => {
    const { auth } = usePage<SharedData>().props;
    const page = usePage();
    return (
        <header className="fixed top-0 right-0 left-0 z-50 flex w-full flex-row items-center justify-between bg-white px-6 py-4 text-sm shadow-md not-has-[nav]:hidden md:px-8 lg:px-10">
            <div className="flex flex-row items-center justify-start">
                <AppLogo />
            </div>
            <div className="flex flex-row items-center gap-4 md:gap-12 lg:gap-20">
                {HEADER_LINKS.map((link, index) => (
                    <Link
                        key={index}
                        href={link.href}
                        className={cn(
                            'text-sm font-semibold text-gray-500',
                            page.url ===
                                (typeof link.href === 'string'
                                    ? link.href
                                    : link.href.url) &&
                                'bg-gradient-to-r from-grad-start to-grad-end bg-clip-text text-transparent',
                        )}
                    >
                        {link.title}
                    </Link>
                ))}
            </div>
            <nav className="flex items-center justify-end gap-4">
                {auth?.user ? (
                    <Link
                        href={dashboard()}
                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                    >
                        Dashboard
                    </Link>
                ) : (
                    <>
                        <Link
                            href={login()}
                            className="inline-block rounded-sm border border-transparent bg-gradient-to-r from-grad-start to-grad-end px-8 py-1.5 text-sm leading-normal font-semibold text-white"
                        >
                            Log in
                        </Link>
                        {/* <Link
                            href={register()}
                            className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                        >
                            Register
                        </Link> */}
                    </>
                )}
            </nav>
        </header>
    );
};
