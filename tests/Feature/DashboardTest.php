<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $this->actingAs($user = User::factory()->create());

        $this->get('/dashboard')->assertOk();
    }

    public function test_dashboard_receives_projects_prop()
    {
        $this->actingAs($user = User::factory()->create());

        $response = $this->get('/dashboard');

        $response->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('projects')
        );
    }
}
