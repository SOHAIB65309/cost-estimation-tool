<?php

namespace Tests\Feature;

use App\Models\DeveloperProfile;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ValidateCsrfToken::class);
    }

    public function test_can_view_team_page(): void
    {
        $user = User::factory()->create();
        $developers = DeveloperProfile::factory()->count(3)->create();

        $response = $this->actingAs($user)->get(route('team.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('settings/team')
            ->has('developerProfiles', 3)
        );
    }

    public function test_can_create_developer_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('team.store'), [
            'name' => 'John Doe',
            'role' => 'Senior Developer',
            'weekly_loc_capacity' => 500,
            'capability_multiplier' => 1.2,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('developer_profiles', [
            'name' => 'John Doe',
            'role' => 'Senior Developer',
            'weekly_loc_capacity' => 500,
            'capability_multiplier' => 1.2,
        ]);
    }

    public function test_can_update_developer_profile(): void
    {
        $user = User::factory()->create();
        $developer = DeveloperProfile::factory()->create();

        $response = $this->actingAs($user)->put(route('team.update', $developer), [
            'name' => 'Updated Name',
            'role' => 'Updated Role',
            'weekly_loc_capacity' => 600,
            'capability_multiplier' => 1.5,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('developer_profiles', [
            'id' => $developer->id,
            'name' => 'Updated Name',
            'role' => 'Updated Role',
            'weekly_loc_capacity' => 600,
            'capability_multiplier' => 1.5,
        ]);
    }

    public function test_can_delete_developer_profile(): void
    {
        $user = User::factory()->create();
        $developer = DeveloperProfile::factory()->create();

        $response = $this->actingAs($user)->delete(route('team.destroy', $developer));

        $response->assertRedirect();
        $this->assertDatabaseMissing('developer_profiles', [
            'id' => $developer->id,
        ]);
    }
}
