<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class CloudinaryService
{
    protected string $cloud;
    protected string $key;
    protected string $secret;
    protected ?string $defaultFolder;

    public function __construct()
    {
        $this->cloud         = config('services.cloudinary.cloud_name');
        $this->key           = config('services.cloudinary.api_key');
        $this->secret        = config('services.cloudinary.api_secret');
        $this->defaultFolder = config('services.cloudinary.folder');
    }

    /**
     * Upload image ke Cloudinary (signed upload).
     * @param UploadedFile|string $file  UploadedFile dari request atau string (URL/base64 data URI)
     * @param array{folder?:string, public_id?:string} $options
     * @return array{url:string, public_id:string, version?:string, bytes?:int, width?:int, height?:int, format?:string}
     */
    public function uploadImage(UploadedFile|string $file, array $options = []): array
    {
        $folder    = $options['folder'] ?? $this->defaultFolder;
        $publicId  = $options['public_id'] ?? null;
        $timestamp = time();

        // 1) Build params untuk signature (urut abjad kunci)
        $paramsToSign = array_filter([
            'folder'    => $folder,
            'public_id' => $publicId,
            'timestamp' => $timestamp,
        ], fn($v) => !is_null($v));

        ksort($paramsToSign);
        $toSign = collect($paramsToSign)->map(fn($v, $k) => "$k=$v")->implode('&') . $this->secret;
        $signature = sha1($toSign);

        $endpoint = "https://api.cloudinary.com/v1_1/{$this->cloud}/image/upload";

        // 2) Kirim multipart/form-data
        if ($file instanceof UploadedFile) {
            $response = Http::asMultipart()
                ->attach('file', file_get_contents($file->getRealPath()), $file->getClientOriginalName())
                ->post($endpoint, array_filter([
                    'api_key'   => $this->key,
                    'timestamp' => $timestamp,
                    'signature' => $signature,
                    'folder'    => $folder,
                    'public_id' => $publicId,
                ]));
        } else {
            // bisa URL (https://...) atau base64 data URI (data:image/png;base64,xxx)
            $response = Http::asMultipart()
                ->attach('file', $file, 'upload.txt')
                ->post($endpoint, array_filter([
                    'api_key'   => $this->key,
                    'timestamp' => $timestamp,
                    'signature' => $signature,
                    'folder'    => $folder,
                    'public_id' => $publicId,
                ]));
        }

        if (!$response->successful()) {
            $msg = $response->json('error.message') ?? 'Cloudinary upload failed';
            throw new \RuntimeException($msg, $response->status());
        }

        $json = $response->json();

        return [
            'url'       => $json['secure_url'] ?? $json['url'],
            'public_id' => $json['public_id'],
            'version'   => (string)($json['version'] ?? ''),
            'bytes'     => (int)($json['bytes'] ?? 0),
            'width'     => (int)($json['width'] ?? 0),
            'height'    => (int)($json['height'] ?? 0),
            'format'    => $json['format'] ?? null,
        ];
    }

    /**
     * Hapus file berdasarkan public_id.
     */
    public function delete(string $publicId): bool
    {
        $timestamp = time();
        $paramsToSign = [
            'public_id' => $publicId,
            'timestamp' => $timestamp,
        ];
        ksort($paramsToSign);
        $toSign    = collect($paramsToSign)->map(fn($v, $k) => "$k=$v")->implode('&') . $this->secret;
        $signature = sha1($toSign);

        $endpoint = "https://api.cloudinary.com/v1_1/{$this->cloud}/image/destroy";
        $response = Http::asForm()->post($endpoint, [
            'api_key'   => $this->key,
            'timestamp' => $timestamp,
            'signature' => $signature,
            'public_id' => $publicId,
        ]);

        return $response->successful() && ($response->json('result') === 'ok');
    }

    /**
     * Helper buat generate public_id rapi.
     * contoh: images/users/123/uuidv4
     */
    public function makePublicId(string $prefix = 'images', ?int $userId = null): string
    {
        return trim(collect([$prefix, $userId ? "u{$userId}" : null, Str::uuid()->toString()])
            ->filter()
            ->implode('/'), '/');
    }
}
