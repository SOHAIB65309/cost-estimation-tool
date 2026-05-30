<?php

namespace Database\Factories;

use App\Models\DeveloperProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DeveloperProfile>
 */
class DeveloperProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'role' => fake()->jobTitle(),
            'weekly_loc_capacity' => fake()->numberBetween(100, 1000),
            'capability_multiplier' => fake()->randomFloat(2, 0.5, 2.0),
        ];
    }
}
