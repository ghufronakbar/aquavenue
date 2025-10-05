<?php

namespace App\Services\Payments;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class MidtransService
{
    public function __construct(
        private readonly string $serverKey,
        private readonly string $appUrl,
        private readonly string $apiUrl
    ) {}

    public static function make(): self
    {
        $cfg = config('services.midtrans');

        return new self(
            serverKey: (string) $cfg['server_key'],
            appUrl: rtrim((string) $cfg['app_url'], '/'),
            apiUrl: rtrim((string) $cfg['api_url'], '/'),
        );
    }

    private function snapClient()
    {
        return Http::withBasicAuth($this->serverKey, '')
            ->asJson()
            ->baseUrl($this->appUrl);
    }

    private function apiClient()
    {
        return Http::withBasicAuth($this->serverKey, '')
            ->asJson()
            ->baseUrl($this->apiUrl);
    }

    /** payload minimal:
     * [
     *   'transaction_details' => ['order_id' => '...', 'gross_amount' => 12345],
     *   'customer_details'    => [...],
     *   'item_details'        => [...],
     *   'callbacks'           => ['finish' => 'https://...'],
     * ]
     */
    public function checkout(array $payload): array
    {
        try {
            $res = $this->snapClient()
                ->post('/snap/v1/transactions', $payload)
                ->throw();

            return $res->json(); // { token, redirect_url, ... }
        } catch (RequestException $e) {
            $body = $e->response?->json();
            $msg  = $body['status_message'] ?? $body['message'] ?? $e->getMessage();
            throw new \RuntimeException('MIDTRANS_ERROR: ' . $msg, previous: $e);
        }
    }

    /** Versi simple ala contoh Node: */
    public function simpleCheckout(string $orderId, int $grossAmount, array $extra = []): array
    {
        $payload = array_replace_recursive([
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => $grossAmount,
            ],
        ], $extra);

        return $this->checkout($payload);
    }

    public function status(string $orderId): array
    {
        try {
            $res = $this->apiClient()
                ->get("/v2/{$orderId}/status")
                ->throw();

            return $res->json();
        } catch (RequestException $e) {
            $body = $e->response?->json();
            $msg  = $body['status_message'] ?? $body['message'] ?? $e->getMessage();
            throw new \RuntimeException('MIDTRANS_ERROR: ' . $msg, previous: $e);
        }
    }

    public function cancel(string $orderId): array
    {
        return $this->apiClient()->post("/v2/{$orderId}/cancel")->throw()->json();
    }

    public function expire(string $orderId): array
    {
        return $this->apiClient()->post("/v2/{$orderId}/expire")->throw()->json();
    }

    /** Verifikasi notifikasi Midtrans (signature_key). */
    public function verifyNotification(array $payload): bool
    {
        // docs: signature_key = sha512(order_id + status_code + gross_amount + serverKey)
        if (!isset($payload['signature_key'])) return false;

        $orderId     = (string) ($payload['order_id'] ?? '');
        $statusCode  = (string) ($payload['status_code'] ?? '');
        $grossAmount = (string) ($payload['gross_amount'] ?? '');
        $calc        = hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey);

        return hash_equals($calc, (string) $payload['signature_key']);
    }
}
