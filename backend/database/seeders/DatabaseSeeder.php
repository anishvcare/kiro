<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // A known demo account with a profile.
        $demo = User::firstOrCreate(
            ['email' => 'demo@matri.nokkoo.in'],
            [
                'name' => 'Demo User',
                'password' => 'password123',
                'tenant_id' => 1,
            ],
        );

        if (! $demo->profile) {
            Profile::factory()->create([
                'user_id' => $demo->id,
                'full_name' => 'Demo User',
                'gender' => 'male',
                'looking_for' => 'female',
            ]);
        }

        // Sample browsable members (each with their own user + profile).
        if (Profile::count() < 24) {
            User::factory()
                ->count(24)
                ->create()
                ->each(function (User $user) {
                    Profile::factory()->create(['user_id' => $user->id]);
                });
        }
    }
}
