'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import upload from '@/routes/upload';
import { ImageOffIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ImageUploaderProps {
    image: string | null;
    setImage: (image: string | null) => void;
    className?: string;
    errorMessage?: string;
    id?: string;
}

interface UploadImageResponse {
    message: string;
    url: string;
    public_id: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
}

const uploadImage = async (formData: FormData) => {
    const res = await fetch(upload.store().url, {
        method: 'POST',
        body: formData,
    });

    const data = (await res.json()) as UploadImageResponse;

    return {
        ok: res.ok,
        data,
    };
};

export const ImageUploader = ({
    image,
    setImage,
    className,
    errorMessage,
    id = 'image-input',
}: ImageUploaderProps) => {
    const [loading, setLoading] = useState(false);
    const onChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (e.target.files?.[0]) {
                setLoading(true);
                if (loading) return;
                const formData = new FormData();
                formData.append('image', e.target.files?.[0]);
                const res = await uploadImage(formData);
                if (res.ok && res?.data?.url) {
                    setImage(res.data.url);
                } else {
                    throw new Error(
                        res?.data?.message || 'Gagal mengunggah gambar',
                    );
                }
            }
        } catch (error) {
            toast.error('Gagal mengunggah gambar');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className={cn('flex flex-col gap-4')}>
            <div
                className={cn(
                    'relative flex !aspect-video w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-md border border-gray-200 p-2',
                    className,
                    errorMessage && 'border-destructive',
                )}
            >
                {loading && (
                    <div className="absolute top-1/2 left-1/2 z-10 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-black/50">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                )}
                <input
                    type="file"
                    onChange={onChangeImage}
                    className="hidden"
                    id={id}
                />
                {image ? (
                    <img
                        src={image}
                        alt="image"
                        width={400}
                        height={400}
                        className="h-full w-full rounded-md object-cover"
                    />
                ) : (
                    <div
                        className="flex h-full w-full flex-col items-center justify-center gap-2"
                        onClick={() => document.getElementById(id)?.click()}
                    >
                        <ImageOffIcon className="h-8 w-8" />
                        Belum ada gambar
                    </div>
                )}
            </div>
            <div className="flex flex-row items-center justify-between">
                <p className={cn('text-sm text-destructive')}>{errorMessage}</p>

                <Button
                    variant="outline"
                    onClick={() => document.getElementById(id)?.click()}
                    type="button"
                    disabled={loading}
                >
                    {loading ? 'Mengunggah...' : 'Unggah Gambar'}
                </Button>
            </div>
        </div>
    );
};
