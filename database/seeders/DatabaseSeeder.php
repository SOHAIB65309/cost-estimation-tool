<?php

namespace Database\Seeders;

use App\Models\DeveloperProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $team = [
            [
                'name' => 'Sohaib',
                'email' => 'sohaib@indusstream.com',
                'role' => 'Full-Stack Architect',
                'multiplier' => 0.80,
                'capacity' => 1500,
            ],
            [
                'name' => 'Dua',
                'email' => 'dua@indusstream.com',
                'role' => 'Lead Frontend',
                'multiplier' => 0.85,
                'capacity' => 1200,
            ],
            [
                'name' => 'Sufiyan',
                'email' => 'sufiyan@indusstream.com',
                'role' => 'Backend Developer',
                'multiplier' => 1.00,
                'capacity' => 1000,
            ],
            [
                'name' => 'Sijjil',
                'email' => 'sijjil@indusstream.com',
                'role' => 'Full-Stack Developer',
                'multiplier' => 1.10,
                'capacity' => 900,
            ],
            [
                'name' => 'Talha',
                'email' => 'talha@indusstream.com',
                'role' => 'Mobile Developer',
                'multiplier' => 1.05,
                'capacity' => 950,
            ],
            [
                'name' => 'Hammad',
                'email' => 'hammad@indusstream.com',
                'role' => 'QA Engineer',
                'multiplier' => 1.20,
                'capacity' => 800,
            ],
            [
                'name' => 'Shahrukh',
                'email' => 'shahrukh@indusstream.com',
                'role' => 'Backend Developer',
                'multiplier' => 1.00,
                'capacity' => 1000,
            ],
            [
                'name' => 'Ahsan',
                'email' => 'ahsan@indusstream.com',
                'role' => 'Frontend Developer',
                'multiplier' => 1.15,
                'capacity' => 850,
            ],
            [
                'name' => 'Abdul Rehman',
                'email' => 'abdulrehman@indusstream.com',
                'role' => 'UI/UX Designer',
                'multiplier' => 1.25,
                'capacity' => 750,
            ],
        ];

        foreach ($team as $member) {
            $user = User::create([
                'name' => $member['name'],
                'email' => $member['email'],
                'password' => Hash::make('12345678'),
            ]);

            DeveloperProfile::create([
                'user_id' => $user->id,
                'name' => $member['name'],
                'role' => $member['role'],
                'weekly_loc_capacity' => $member['capacity'],
                'capability_multiplier' => $member['multiplier'],
            ]);
        }

        $this->call([
            EstimationSeeder::class,
        ]);
    }
}
