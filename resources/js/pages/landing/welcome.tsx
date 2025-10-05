import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    ArrowRightIcon,
    ClockIcon,
    LucideIcon,
    PhoneIcon,
    StarIcon,
    Waves,
} from 'lucide-react';
import { FaRegStar, FaStar } from 'react-icons/fa';
import LandingLayout from './landing-layout';

interface Facility {
    name: string;
    description: string;
    price: number;
    icon: LucideIcon;
}

const FACILITIES: Facility[] = [
    {
        name: 'Kolam Renang',
        description: 'Kolam renang dengan sistem filtrasi terbaik',
        price: 100000,
        icon: Waves,
    },
    {
        name: 'Kolam Renang',
        description: 'Kolam renang dengan sistem filtrasi terbaik',
        price: 100000,
        icon: Waves,
    },
    {
        name: 'Kolam Renang',
        description: 'Kolam renang dengan sistem filtrasi terbaik',
        price: 100000,
        icon: Waves,
    },
];

interface Pricing {
    name: string;
    price: number;
    features: string[];
}

const PRICING: Pricing[] = [
    {
        name: 'Basic',
        price: 75000,
        features: ['Kolam Renang', 'Area Santai', 'Parkir Gratis'],
    },
    {
        name: 'Premium',
        price: 150000,
        features: [
            'Kolam Renang',
            'Gazebo Premium',
            'Perlengkapan Olahraga',
            'Welcome Drink',
        ],
    },
    {
        name: 'Family',
        price: 250000,
        features: [
            'Perlengkapan Olahraga',
            'Welcome Drink',
            'Kamar Mandi Dalam',
        ],
    },
];

interface Testimonial {
    name: string;
    rating: number;
    description: string;
    image: string | null;
}

const TESTIMONIAL: Testimonial[] = [
    {
        name: 'John Doe',
        rating: 5,
        description:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
        image: null,
    },
    {
        name: 'Jane Doe',
        rating: 4,
        description:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
        image: '/bg-login.jpg',
    },
    {
        name: 'John Doe',
        rating: 2,
        description:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
        image: null,
    },
    {
        name: 'John Doe',
        rating: 2,
        description:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
        image: null,
    },
    {
        name: 'John Doe',
        rating: 2,
        description:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
        image: null,
    },
];

export default function Welcome() {
    return (
        <LandingLayout>
            <div className="flex w-full flex-col items-center justify-center">
                <section
                    id="hero"
                    className="relative flex min-h-[calc(100vh-10rem)] w-full flex-col items-center justify-center"
                >
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-white opacity-70" />
                        <img
                            src="/hero.jpg"
                            alt="hero"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="z-10 mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center gap-4">
                        <h1 className="bg-gradient-to-r from-grad-start to-grad-end bg-clip-text text-6xl font-bold text-transparent">
                            AquaVenue Resort
                        </h1>
                        <p className="text-center text-lg text-gray-800">
                            Nikmati pelayanan tak terlupakan dengan fasilitas
                            premium dan pelayanan terbaik untuk keluarga Anda
                        </p>
                        <div className="flex h-full w-full flex-row items-center justify-center gap-4">
                            <button className="flex flex-row items-center justify-center gap-2 rounded-md bg-gradient-to-r from-grad-start to-grad-end px-4 py-2 text-white">
                                <span>Booking Sekarang</span>
                                <ArrowRightIcon className="h-4 w-4" />
                            </button>
                            <div className="flex flex-row items-center justify-center gap-2">
                                <ClockIcon className="h-4 w-4" />
                                <p className="text-gray-800">08:00 - 22:00</p>
                            </div>
                            <div className="flex flex-row items-center justify-center gap-2">
                                <PhoneIcon className="h-4 w-4" />
                                <p className="text-gray-800">0812-3456-7890</p>
                            </div>
                        </div>
                        <div className="mt-8 flex h-full w-full flex-row items-center justify-around">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="text-2xl font-bold text-primary">
                                    50+
                                </div>
                                <p className="text-gray-800">Fasilitas</p>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="text-2xl font-bold text-primary">
                                    1000+
                                </div>
                                <p className="text-gray-800">Happy Customers</p>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="text-2xl font-bold text-primary">
                                    24/7
                                </div>
                                <p className="text-gray-800">Support</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section
                    id="facilities"
                    className="flex w-full flex-col items-center justify-center px-4 py-8 md:py-16 lg:py-24"
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
                                        Booking Sekarang
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
                <section
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
                <section
                    id="testimonial"
                    className="flex w-full flex-col items-center justify-center px-4 py-8 md:py-16 lg:py-24"
                >
                    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-2">
                        <h2 className="text-4xl font-bold">Testimoni</h2>
                        <p className="text-neutral-500">
                            Dengarkan pengalaman mereka yang telah merasakan
                            pelayanan kami
                        </p>
                    </div>
                    <div className="mt-8 flex flex-row items-center justify-center gap-4 px-8">
                        {TESTIMONIAL.map((testimonial, index) => (
                            <Card
                                key={index}
                                className="group transition-all duration-300 hover:scale-105"
                            >
                                <CardContent className="flex flex-col justify-center gap-4 p-4">
                                    <div className="flex flex-row items-center gap-2">
                                        <img
                                            src={
                                                testimonial.image ||
                                                '/bg-login.jpg'
                                            }
                                            alt={testimonial.name}
                                            className="h-10 w-10 rounded-full"
                                        />
                                        <div className="flex flex-col">
                                            <p className="font-semibold">
                                                {testimonial.name}
                                            </p>
                                            <div className="flex flex-row items-center">
                                                {Array.from({
                                                    length: 5,
                                                }).map((_, index) => {
                                                    const isFilled =
                                                        index <
                                                        testimonial.rating;
                                                    return isFilled ? (
                                                        <FaStar
                                                            key={index}
                                                            className="h-4 w-4 text-yellow-500"
                                                        />
                                                    ) : (
                                                        <FaRegStar
                                                            key={index}
                                                            className="h-4 w-4 text-gray-500"
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-neutral-500 italic">
                                        "{testimonial.description}"
                                    </span>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </LandingLayout>
    );
}
