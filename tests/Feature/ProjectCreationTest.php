<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ProjectCreationTest extends TestCase
{
    use RefreshDatabase, WithoutMiddleware;

    /**
     * Test project creation with mocked external API.
     */
    public function test_project_can_be_created_with_scraped_data(): void
    {
        $this->actingAs($user = User::factory()->create());

        Http::fake([
            'http://127.0.0.1:8001/api/scrape' => Http::response([
                'input_forms' => 2,
                'ui_components' => 5,
                'action_endpoints' => 3,
            ], 200),
        ]);

        $response = $this->post('/projects', [
            'title' => 'Test Project',
            'proxy_source_url' => 'https://example.com',
        ]);

        $response->assertRedirect('/dashboard');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('projects', [
            'title' => 'Test Project',
            'proxy_source_url' => 'https://example.com',
        ]);

        $project = Project::where('title', 'Test Project')->first();
        $this->assertEquals('Awaiting Delphi', $project->status);
        $this->assertCount(3, $project->wbsComponents);

        // All scraped components should start at 0
        foreach ($project->wbsComponents as $component) {
            $this->assertEquals(0, $component->best_case_hours);
            $this->assertEquals(0, $component->computed_pert_effort);
        }
    }

    /**
     * Test manual component addition.
     */
    public function test_manual_component_can_be_added(): void
    {
        $this->actingAs($user = User::factory()->create());
        $project = Project::create(['title' => 'Existing Project', 'status' => 'Awaiting Delphi']);

        $response = $this->post("/projects/{$project->id}/components", [
            'name' => 'CI/CD Pipeline',
            'component_type' => 'Infrastructure',
            'best_case_hours' => 5,
            'most_likely_hours' => 10,
            'worst_case_hours' => 20,
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('wbs_components', [
            'project_id' => $project->id,
            'name' => 'CI/CD Pipeline',
        ]);

        $project->refresh();
        // (5 + 4*10 + 20) / 6 = 65 / 6 = 10.83 -> rounded to 11
        $this->assertEquals(11, $project->final_estimated_hours);
    }
}
