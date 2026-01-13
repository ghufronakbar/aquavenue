<?php

namespace App\Http\Controllers\Management;

use App\Enums\FacilityType;
use App\Enums\Role;
use App\Models\Facility;
use App\Models\User;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\FacilityStockIn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ManagementMutateController extends Controller
{

    // FASILITAS
    public function deleteFasilitas(Request $request)
    {
        $facility = Facility::where('id', $request->id)->first();
        if (!$facility) {
            return redirect()->route('management-fasilitas')->with('error', 'Fasilitas tidak ditemukan');
        }
        $facility->delete();
        return redirect()->route('management-fasilitas')->with('success', 'Fasilitas berhasil dihapus');
    }

    public function addAmountFasilitas(Request $request)
    {
        $validated = $request->validate([
            'id' => ['required', 'exists:facilities,id'],
            'new_amount' => ['required', 'integer'],
        ]);
        $facility = Facility::withAvailableStock()->where('id', $request->id)->first();
        if (!$facility) {
            return redirect()->route('management-fasilitas')->with('error', 'Fasilitas tidak ditemukan');
        }
        $gapAmount = (int) $validated['new_amount'] - (int) $facility->available_stock;
        FacilityStockIn::create([
            'facility_id' => $facility->id,
            'stock' => $gapAmount,
        ]);
        return redirect()->route('management-fasilitas')->with('success', 'Jumlah fasilitas berhasil diubah');
    }

    public function editFasilitas(Request $request)
    {
        $validated = $request->validate([
            'id' => ['required', 'exists:facilities,id'],
            'facility_name' => ['required', 'string', 'max:255'],
            'facility_price' => ['required', 'integer'],
            'facility_description' => ['required', 'string'],
            'facility_image' => ['nullable', 'string'],
            'facility_type' => ['required', 'string', 'in:' . FacilityType::Sell->value . ',' . FacilityType::Rent->value],
        ]);
        $facility = Facility::where('id', $request->id)->first();
        if (!$facility) {
            return redirect()->route('management-fasilitas')->with('error', 'Fasilitas tidak ditemukan');
        }
        $facility->update($validated);
        return redirect()->route('management-fasilitas')->with('success', 'Fasilitas berhasil diubah');
    }

    public function addFasilitas(Request $request)
    {
        $validated = $request->validate([
            'facility_name' => ['required', 'string', 'max:255'],
            'facility_price' => ['required', 'integer'],
            'facility_description' => ['required', 'string'],
            'facility_image' => ['nullable', 'string'],
            'facility_type' => ['required', 'string', 'in:' . FacilityType::Sell->value . ',' . FacilityType::Rent->value],
            'initial_stock' => ['required', 'integer'],
        ]);

        $facility = Facility::create($validated);
        FacilityStockIn::create([
            'facility_id' => $facility->id,
            'stock' => $validated["initial_stock"],
        ]);

        return redirect()->route('management-fasilitas')->with('success', 'Fasilitas berhasil ditambahkan');
    }

    // KARYAWAN

    public function deleteKaryawan(Request $request)
    {
        $user = User::where('id', $request->id)->first();
        if (!$user) {
            return redirect()->route('management-karyawan')->with('error', 'Karyawan tidak ditemukan');
        }
        $user->delete();
        return redirect()->route('management-karyawan')->with('success', 'Karyawan berhasil dihapus. Email: ' . $user->email);
    }

    public function addKaryawan(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
        ]);
        $checkEmail = User::withTrashed()->where('email', $validated['email'])->first();
        if ($checkEmail && $checkEmail->deleted_at == null) {
            return redirect()->route('management-karyawan')->with('error', 'Email sudah terdaftar');
        }
        if ($checkEmail && $checkEmail->deleted_at != null) {
            $checkEmail->restore();
            $password = "12345678";
            $hashedPassword = Hash::make($password);
            $checkEmail->update([
                'password' => $hashedPassword,
                'name' => $validated['name'],
            ]);
            return redirect()->route('management-karyawan')->with('success', 'Karyawan berhasil ditambahkan dengan default password: ' . $password);
        } else {
            $password = "12345678";
            $hashedPassword = Hash::make($password);
            User::create(
                [
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => $hashedPassword,
                    'role' => Role::Admin,
                ]
            );
            return redirect()->route('management-karyawan')->with('success', 'Karyawan berhasil ditambahkan dengan default password: ' . $password);
        }
    }
}
