<?php

namespace App\Http\Controllers;

use App\Services\CloudinaryService;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __construct(private CloudinaryService $cloudinary) {}

    public function store(Request $request)
    {

        try {
            // Bisa kirim file binary (input name: "image") ATAU base64/url (input name: "source")
            $validated = $request->validate([
                'image'  => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,avif', 'max:5120'], // 5MB
                'source' => ['nullable', 'string'], // URL atau base64 data URI
                'folder' => ['nullable', 'string'],
            ]);

            if (!$request->hasFile('image') && empty($validated['source'])) {
                return response()->json(['message' => 'No file or source provided'], 422);
            }

            $publicId = $this->cloudinary->makePublicId(
                $validated['folder'] ?? 'uploads',
                optional($request->user())->id
            );

            $result = $request->hasFile('image')
                ? $this->cloudinary->uploadImage($request->file('image'), [
                    'folder'    => $validated['folder'] ?? null,
                    'public_id' => $publicId,
                ])
                : $this->cloudinary->uploadImage($validated['source'], [
                    'folder'    => $validated['folder'] ?? null,
                    'public_id' => $publicId,
                ]);

            // return hanya url (dan info tambahan jika perlu)
            return response()->json([
                'message'    => 'Uploaded',
                'url'        => $result['url'],
                'public_id'  => $result['public_id'],
                'width'      => $result['width'] ?? null,
                'height'     => $result['height'] ?? null,
                'bytes'      => $result['bytes'] ?? null,
                'format'     => $result['format'] ?? null,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Upload failed',
                'error'   => $e->getMessage(),
                'trace' => $e->getTrace(),
            ], 500);
        }
    }
}
