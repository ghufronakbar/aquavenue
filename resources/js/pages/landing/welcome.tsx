import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { initialsFromName } from '@/lib/helper';
import { ArrowRightIcon, ClockIcon, HomeIcon, PhoneIcon } from 'lucide-react';
import { BsSunglasses } from 'react-icons/bs';
import { FaLifeRing, FaRegStar, FaStar } from 'react-icons/fa';
import { IconType } from 'react-icons/lib';
import LandingLayout from './landing-layout';

interface Facility {
    name: string;
    description: string;
    price: number;
    icon: IconType;
}

const FACILITIES: Facility[] = [
    {
        name: 'Pelampung',
        description: 'Pelampung anak dan dewasa.',
        price: 100000,
        icon: FaLifeRing,
    },
    {
        name: 'Gazebo',
        description: 'Gazebo nyaman untuk bersantai.',
        price: 50000,
        icon: HomeIcon,
    },
    {
        name: 'Kacamata Renang',
        description: 'Kacamata renang anti-fog untuk anak & dewasa.',
        price: 100000,
        icon: BsSunglasses,
    },
];

// interface Pricing {
//     name: string;
//     price: number;
//     features: string[];
// }

// const PRICING: Pricing[] = [
//     {
//         name: 'Basic',
//         price: 75000,
//         features: ['Kolam Renang', 'Area Santai', 'Parkir Gratis'],
//     },
//     {
//         name: 'Premium',
//         price: 150000,
//         features: [
//             'Kolam Renang',
//             'Gazebo Premium',
//             'Perlengkapan Olahraga',
//             'Welcome Drink',
//         ],
//     },
//     {
//         name: 'Family',
//         price: 250000,
//         features: [
//             'Perlengkapan Olahraga',
//             'Welcome Drink',
//             'Kamar Mandi Dalam',
//         ],
//     },
// ];

interface Testimonial {
    name: string;
    rating: number;
    description: string;
    image: string | null;
}

const TESTIMONIAL: Testimonial[] = [
    {
        name: 'Rizky Pratama',
        rating: 5,
        description:
            'Proses booking super cepat, dapat kode QR dan tinggal scan saat masuk. Kolamnya bersih, airnya jernih.',
        image: '/images/avatars/1.jpg',
    },
    {
        name: 'Ayu Wulandari',
        rating: 4,
        description:
            'Tempatnya nyaman buat keluarga. Lifeguard selalu standby. Weekend agak ramai, saran datang pagi.',
        image: null,
    },
    {
        name: 'Budi Santoso',
        rating: 5,
        description:
            'Anak saya ikut kelas renang pemula, pelatihnya sabar dan komunikatif. Pembayaran via QRIS lancar.',
        image: '/images/avatars/3.jpg',
    },
    {
        name: 'Siti Rahma',
        rating: 3,
        description:
            'Fasilitas oke, kamar bilas bersih. Parkir agak penuh saat sore, tapi reschedule di aplikasi mudah.',
        image: null,
    },
    {
        name: 'Albertus Yohanes',
        rating: 5,
        description:
            'Kolam anak hangat, ada area teduh untuk orang tua. Staf ramah dan informatif.',
        image: '/images/avatars/5.jpg',
    },
    {
        name: 'Nabila Putri',
        rating: 4,
        description:
            'Booking rombongan untuk arisan keluarga berjalan lancar. Harga sesuai. Mungkin bisa tambah kursi santai.',
        image: '/images/avatars/6.jpg',
    },
    {
        name: 'Dwi Saputra',
        rating: 5,
        description:
            'Cocok buat latihan lap 50m. Jalur jelas, pagi hari relatif sepi. Air tidak terlalu berbau kaporit.',
        image: null,
    },
    {
        name: 'Laila Amalia',
        rating: 4,
        description:
            'Reservasi melalui website gampang banget. Anak-anak betah di kolam dangkal dengan mainan air.',
        image: '/images/avatars/8.jpg',
    },
    {
        name: 'Fajar Hidayat',
        rating: 3,
        description:
            'Datang saat hujan, beberapa lantai jadi licin. CS cepat tanggap dan kasih voucher kunjungan ulang.',
        image: null,
    },
    {
        name: 'Tania Oktaviani',
        rating: 5,
        description:
            'Locker aman, shower air hangat berfungsi semua. Area bersih dan rapi. Recommended!',
        image: '/images/avatars/10.jpg',
    },
    {
        name: 'Agung Nugroho',
        rating: 4,
        description:
            'Check-in pakai QR super cepat, antri minimal. Kebijakan refund jelas dan transparan.',
        image: null,
    },
    {
        name: 'Rika Lestari',
        rating: 5,
        description:
            'Bawa bayi, ruang laktasi tersedia dan nyaman. Toiletnya bersih, tisu selalu ada.',
        image: '/images/avatars/12.jpg',
    },
    {
        name: 'Muhammad Iqbal',
        rating: 4,
        description:
            'Ikut kelas aquafit pagi, instruktur energik. Musik pas, tidak terlalu keras. Bakal langganan.',
        image: null,
    },
    {
        name: 'Cindy Halim',
        rating: 5,
        description:
            'Area hijau bagus buat foto, ada kafe kecil di sisi kolam. Proses booking mulus tanpa ribet.',
        image: '/images/avatars/14.jpg',
    },
    {
        name: 'Yudi Kurniawan',
        rating: 3,
        description:
            'Harga weekend sedikit lebih tinggi, tapi sebanding dengan fasilitas. Saran tambah jam malam.',
        image: null,
    },
];

export default function Welcome() {
    return (
        <LandingLayout>
            <div className="flex w-full flex-col items-center justify-center">
                <section
                    id="beranda"
                    className="relative flex min-h-[calc(100vh-2rem)] w-full flex-col items-center justify-center"
                >
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-black opacity-20" />
                        <img
                            src="/hero.jpg"
                            alt="hero"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="z-10 mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center gap-4">
                        <h1 className="bg-gradient-to-r from-grad-start to-grad-end bg-clip-text pb-4 text-center text-5xl font-bold text-transparent mb-4 z-10 bg-red-500">
                            Kolam Renang Pandan Wangi
                        </h1>
                        <p className="text-center text-lg text-gray-200">
                            Nikmati pelayanan tak terlupakan dengan fasilitas
                            premium dan pelayanan terbaik untuk keluarga Anda
                        </p>
                        <div className="flex h-full w-full flex-row flex-wrap items-center justify-center gap-4">
                            <button className="flex flex-row items-center justify-center gap-2 rounded-md bg-gradient-to-r from-grad-start to-grad-end px-4 py-2 text-white">
                                <a href="/pesan" className="flex flex-row items-center justify-center gap-2">
                                    <span>Booking Sekarang</span>
                                    <ArrowRightIcon className="h-4 w-4" />
                                </a>
                            </button>
                            <div className="flex flex-row items-center justify-center gap-2">
                                <div className="flex flex-row items-center justify-center gap-2">
                                    <ClockIcon className="h-4 w-4" />
                                    <p className="text-gray-800">
                                        08:00 - 17:00
                                    </p>
                                </div>
                                <div className="flex flex-row items-center justify-center gap-2">
                                    <PhoneIcon className="h-4 w-4" />
                                    <p className="text-gray-800">
                                        0812-3456-7890
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section
                    id="pesan"
                    className="flex w-full flex-col items-center justify-center px-4 py-8 md:py-16 lg:py-24 min-h-[calc(100vh-2rem)]"
                >
                    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-2">
                        <h2 className="text-4xl font-bold">
                            Fasilitas Premium
                        </h2>
                        <p className="text-neutral-500">
                            Temukan berbagai fasilitas berkualitas tinggi yang
                            dirancang untuk memberikan pengalaman terbaik
                        </p>
                    </div>
                    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {FACILITIES.map((facility, index) => (
                            <Card
                                key={index}
                                className="group transition-all duration-300 hover:scale-105"
                            >
                                <CardContent className="flex flex-col items-center justify-center gap-2">
                                    <div className="relative flex items-center justify-center rounded-full bg-gradient-to-r from-grad-start to-grad-end p-2">
                                        <div className="absolute inset-0 rounded-full bg-white opacity-60" />
                                        <facility.icon className="z-10 h-8 w-8 text-primary" />
                                    </div>
                                    <div className="flex flex-col items-center justify-center">
                                        <h3 className="text-2xl font-bold">
                                            {facility.name}
                                        </h3>
                                        <p className="text-neutral-500">
                                            {facility.description}
                                        </p>
                                    </div>
                                    <p className="text-lg font-bold text-primary">
                                        {`Mulai dari Rp. ${facility.price}`}
                                    </p>
                                    <Button className="mt-4 w-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-grad-start group-hover:to-grad-end group-hover:text-white">
                                        <a href="/pesan">Booking Sekarang</a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* <section
                    id="pricing"
                    className="flex w-full flex-col items-center justify-center px-4 py-8 md:py-16 lg:py-24"
                >
                    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-2">
                        <h2 className="text-4xl font-bold">Paket Harga</h2>
                        <p className="text-neutral-500">
                            Pilih paket sesuai dengan kebutuhan Anda
                        </p>
                    </div>
                    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {PRICING.map((pricing, index) => (
                            <Card
                                key={index}
                                className="group transition-all duration-300 hover:scale-105"
                            >
                                <CardContent className="flex flex-col items-center justify-center gap-4 p-4 px-16">
                                    <h3 className="text-xl font-bold">
                                        {pricing.name}
                                    </h3>

                                    <div className="flex flex-col items-center justify-center">
                                        <p className="text-3xl font-bold text-primary">
                                            {`Rp. ${pricing.price}`}
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            per sesi
                                        </p>
                                    </div>
                                    <div className="flex w-full flex-col gap-2">
                                        {pricing.features.map(
                                            (feature, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-row items-center gap-2"
                                                >
                                                    <StarIcon className="h-4 w-4 text-yellow-500" />
                                                    <p className="text-sm text-black">
                                                        {feature}
                                                    </p>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <Button className="mt-4 w-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-grad-start group-hover:to-grad-end group-hover:text-white">
                                        Pilih Paket
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
                 */}
                <section
                    id="testimoni"
                    className="flex w-full flex-col items-center justify-center px-4 py-8 md:py-16 lg:py-24 min-h-[calc(100vh-2rem)]"
                >
                    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-2">
                        <h2 className="text-4xl font-bold">Testimoni</h2>
                        <p className="text-neutral-500">
                            Dengarkan pengalaman mereka yang telah merasakan
                            pelayanan kami
                        </p>
                    </div>
                    <ScrollArea className="w-full">
                        <div
                            role="list"
                            className="grid auto-cols-[minmax(18rem,18rem)] grid-flow-col items-stretch gap-4 p-4 sm:auto-cols-[minmax(20rem,20rem)]"
                        >
                            {[...TESTIMONIAL].map((t, i) => (
                                <Card
                                    key={i}
                                    className="group h-full transition-all duration-300 hover:scale-105"
                                >
                                    <CardContent className="grid h-full grid-rows-[auto,1fr] gap-4 p-4">
                                        {/* Header */}
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 shrink-0">
                                                <AvatarImage
                                                    src={
                                                        t.image ||
                                                        '/bg-login.jpg'
                                                    }
                                                    alt={t.name}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback>
                                                    {initialsFromName(t.name)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="min-w-0">
                                                <p className="truncate font-semibold">
                                                    {t.name}
                                                </p>
                                                <div className="flex items-center">
                                                    {Array.from({
                                                        length: 5,
                                                    }).map((_, si) =>
                                                        si < t.rating ? (
                                                            <FaStar
                                                                key={si}
                                                                className="h-4 w-4 text-yellow-500"
                                                            />
                                                        ) : (
                                                            <FaRegStar
                                                                key={si}
                                                                className="h-4 w-4 text-muted-foreground"
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Deskripsi (multi-line, ikut tinggi tertinggi) */}
                                        <p className="text-sm leading-relaxed text-pretty break-words whitespace-normal text-muted-foreground italic">
                                            “{t.description}”
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </section>
                <Footer />
            </div>
        </LandingLayout>
    );
}

const Footer = () => {
    return (
        <div className="flex flex-row items-center justify-center gap-4">
            <p className="text-sm text-neutral-500">
                © 2025 Kolam Renang Pandan Wangi. All rights reserved.
            </p>
        </div>
    );
};
