<?php

namespace Database\Seeders;

use App\Models\DeveloperProfile;
use Illuminate\Database\Seeder;

class DeveloperProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DeveloperProfile::create([
            'name' => 'Dua',
            'role' => 'Lead Frontend',
            'weekly_loc_capacity' => 1200,
            'capability_multiplier' => 0.85,
        ]);

        DeveloperProfile::create([
            'name' => 'Sohaib',
            'role' => 'Full-Stack Architect',
            'weekly_loc_capacity' => 1500,
            'capability_multiplier' => 0.80,
        ]);
    }
}
