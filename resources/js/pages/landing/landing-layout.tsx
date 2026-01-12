import AppLogo from '@/components/app-logo';
import { cn } from '@/lib/utils';
import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

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
            <Head title="Pandan Wangi">
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

interface HeaderItem {
    title: string;
    targetId: string;
}

const HEADER_ITEMS: HeaderItem[] = [
    { title: 'Beranda', targetId: 'beranda' },
    { title: 'Pesan', targetId: 'pesan' },
    { title: 'Testimonial', targetId: 'testimoni' },
];

const LandingHeader = () => {
    const { auth } = usePage<SharedData>().props;
    const [activeId, setActiveId] = useState<string>(HEADER_ITEMS[0].targetId);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const appearance = localStorage.getItem('appearance');
            if (appearance !== 'light')
                localStorage.setItem('appearance', 'light');
        }
    }, []);

    // util: smooth scroll dengan offset header
    const smoothScrollToId = (id: string) => {
        if (typeof window === 'undefined') return;
        const el = document.getElementById(id);
        if (!el) return;

        const header = document.querySelector<HTMLElement>(
            'header[data-header="landing"]',
        );
        const headerH = header?.offsetHeight ?? 0;

        const y =
            el.getBoundingClientRect().top + window.pageYOffset - headerH - 8;

        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        window.history.replaceState(null, '', `#${id}`);
        window.scrollTo({ top: y, behavior: 'smooth' });
        el.focus({ preventScroll: true });
    };

    // handler: jika bukan "/" → kembali ke "/" lalu scroll
    const goToSection = (id: string) => {
        if (typeof window === 'undefined') return;
        const isHome = window.location.pathname === '/';

        setActiveId(id); // update visual seketika
        if (isHome) {
            smoothScrollToId(id);
        } else {
            router.get(
                '/',
                {},
                {
                    preserveScroll: false,
                    onSuccess: () =>
                        requestAnimationFrame(() => smoothScrollToId(id)),
                },
            );
        }
    };

    // auto-scroll jika ada hash saat mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const hash = window.location.hash.replace(/^#/, '');
        if (hash) {
            setActiveId(hash);
            requestAnimationFrame(() => smoothScrollToId(hash));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // observasi section yg sedang in-view (dengan kompensasi tinggi header)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const header = document.querySelector<HTMLElement>(
            'header[data-header="landing"]',
        );
        const headerH = header?.offsetHeight ?? 0;

        const sections = HEADER_ITEMS.map((i) =>
            document.getElementById(i.targetId),
        ).filter(Boolean) as HTMLElement[];

        if (!sections.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                // pilih entry yang paling “in-view”
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort(
                        (a, b) =>
                            (b.intersectionRatio || 0) -
                            (a.intersectionRatio || 0),
                    );

                if (visible[0]?.target?.id) {
                    setActiveId(visible[0].target.id);
                }
            },
            {
                root: null,
                threshold: [0.51], // >50% terlihat dianggap aktif
                // kompensasi header di atas + sedikit bias bawah agar fokus sesuai pandangan user
                rootMargin: `-${headerH + 8}px 0px -40% 0px`,
            },
        );

        sections.forEach((sec) => observer.observe(sec));
        return () => observer.disconnect();
    }, []);

    return (
        <header
            data-header="landing"
            className="fixed top-0 right-0 left-0 z-50 flex w-full flex-row items-center justify-between bg-white px-6 py-4 text-sm shadow-md not-has-[nav]:hidden md:px-8 lg:px-10"
        >
            <div className="flex flex-row items-center justify-start">
                <AppLogo />
            </div>

            <div className="flex flex-row items-center gap-4 md:gap-12 lg:gap-20">
                {HEADER_ITEMS.map((item, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => goToSection(item.targetId)}
                        className={cn(
                            'text-sm font-semibold transition-colors',
                            activeId === item.targetId
                                ? 'bg-gradient-to-r from-grad-start to-grad-end bg-clip-text text-transparent'
                                : 'text-gray-500 hover:text-gray-900',
                        )}
                        aria-current={
                            activeId === item.targetId ? 'true' : undefined
                        }
                    >
                        {item.title}
                    </button>
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
                    <Link
                        href={login()}
                        className="inline-block rounded-sm border border-transparent bg-gradient-to-r from-grad-start to-grad-end px-8 py-1.5 text-sm leading-normal font-semibold text-white"
                    >
                        Log in
                    </Link>
                )}
            </nav>
        </header>
    );
};
