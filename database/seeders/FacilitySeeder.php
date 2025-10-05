<?php

namespace Database\Seeders;

use App\Enums\FacilityType;
use App\Models\Facility;
use App\Models\FacilityStockIn;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    public function run(): void
    {
        // 1) Seed 10 fasilitas (pakai key 'initial_stock' untuk kebutuhan stock-ins)
        $facilities = [
            [
                'facility_name'        => 'Gazebo',
                'facility_price'       => 50000,
                'facility_description' => 'Gazebo nyaman untuk bersantai.',
                'facility_image'       => null,
                'facility_type'        => FacilityType::Rent->value,
                'initial_stock'        => 6,
            ],
            [
                'facility_name'        => 'Kacamata Renang',
                'facility_price'       => 30000,
                'facility_description' => 'Kacamata renang anti-fog untuk anak & dewasa.',
                'facility_image'       => null,
                'facility_type'        => FacilityType::Sell->value,
                'initial_stock'        => 20,
            ],
            [
                'facility_name'        => 'Welcome Drink',
                'facility_price'       => 0,
                'facility_description' => 'Minuman selamat datang (teh/air mineral).',
                'facility_image'       => null,
                'facility_type'        => FacilityType::Sell->value,
                'initial_stock'        => 999,
            ],
            [
                'facility_name'        => 'Pelampung',
                'facility_price'       => 15000,
                'facility_description' => 'Pelampung anak dan dewasa.',
                'facility_image'       => null,
                'facility_type'        => FacilityType::Rent->value,
                'initial_stock'        => 30,
            ],
            [
                'facility_name'        => 'Handuk',
                'facility_price'       => 10000,
                'facility_description' => 'Sewa handuk bersih dan wangi.',
                'facility_image'       => null,
                'facility_type'        => FacilityType::Rent->value,
                'initial_stock'        => 25,
            ],
            [
                'facility_name'        => 'Loker',
                'facility_price'       => 10000,
                'facility_description' => 'Loker penyimpanan barang (kunci fisik).',
                'facility_image'       => null,
                'facility_type'        => FacilityType::Rent->value,
                'initial_stock'        => 40,
            ],
            [
                'facility_name'        => 'Ban Donat',
                'facility_price'       => 20000,
                'facility_description' => 'Ban donat untuk bermain di kolam arus.',
                'facility_image'       => null,
                'facility_type'        => FacilityType::Rent->value,
                'initial_stock'        => 15,
            ],
            [
                'facility_name'        => 'Life Jacket',
                'facility_price'       => 25000,
                'facility_description' => 'Rompi pelampung keselamatan.',
                'facility_image'       => null,
                'facility_type'        => FacilityType::Rent->value,
                'initial_stock'        => 12,
            ],
            [
                'facility_name'        => 'Kursi Lipat',
                'facility_price'       => 8000,
                'facility_description' => 'Kursi lipat tambahan di tepi kolam.',
                'facility_image'       => null,
                'facility_type'        => FacilityType::Rent->value,
                'initial_stock'        => 30,
            ],
            [
                'facility_name'        => 'Sunblock',
                'facility_price'       => 35000,
                'facility_description' => 'Krim tabir surya SPF 50.',
                'facility_image'       => null,
                'facility_type'        => FacilityType::Sell->value,
                'initial_stock'        => 18,
            ],
        ];

        // buat/ubah Facility tanpa duplikasi berdasarkan nama
        $facilityIdsByName = [];
        foreach ($facilities as $f) {
            $model = Facility::updateOrCreate(
                ['facility_name' => $f['facility_name']],
                [
                    'facility_price'       => $f['facility_price'],
                    'facility_description' => $f['facility_description'],
                    'facility_image'       => $f['facility_image'],
                    'facility_type'        => $f['facility_type'],
                ]
            );

            $facilityIdsByName[$model->facility_name] = $model->id;

            // === Seed 1 baris awal di facility_stock_ins (idempotent) ===
            // Jika belum ada satupun stock-in untuk facility ini, buat satu.
            $hasStock = FacilityStockIn::where('facility_id', $model->id)->exists();
            if (! $hasStock) {
                FacilityStockIn::create([
                    'facility_id' => $model->id,
                    'stock'       => (int) $f['initial_stock'],
                ]);
            }
        }
    }
}
