<?php

namespace Tests\Feature;

use App\Models\DelphiVote;
use App\Models\Project;
use App\Models\User;
use App\Models\WbsComponent;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DelphiSessionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ValidateCsrfToken::class);
    }

    public function test_cannot_lock_if_less_than_two_votes(): void
    {
        $user = User::factory()->create();
        $project = Project::create(['title' => 'Test Project', 'status' => 'Awaiting Delphi']);
        $component = WbsComponent::create([
            'project_id' => $project->id,
            'name' => 'Component 1',
            'component_type' => 'UI',
            'best_case_hours' => 5,
            'most_likely_hours' => 10,
            'worst_case_hours' => 20,
            'computed_pert_effort' => 11,
        ]);

        // Only 1 vote
        DelphiVote::create([
            'wbs_component_id' => $component->id,
            'developer_name' => 'Dev 1',
            'voted_hours' => 11,
        ]);

        $response = $this->actingAs($user)->post(route('projects.lock', $project));

        $response->assertSessionHasErrors('consensus');
        $this->assertEquals('Awaiting Delphi', $project->refresh()->status);
    }

    public function test_cannot_lock_if_high_variance(): void
    {
        $user = User::factory()->create();
        $project = Project::create(['title' => 'Test Project', 'status' => 'Awaiting Delphi']);
        $component = WbsComponent::create([
            'project_id' => $project->id,
            'name' => 'Component 1',
            'component_type' => 'UI',
            'best_case_hours' => 5,
            'most_likely_hours' => 10,
            'worst_case_hours' => 20,
            'computed_pert_effort' => 11,
        ]);

        // Votes with > 15% variance: (20 - 10) / 10 = 100% variance
        DelphiVote::create([
            'wbs_component_id' => $component->id,
            'developer_name' => 'Dev 1',
            'voted_hours' => 10,
        ]);
        DelphiVote::create([
            'wbs_component_id' => $component->id,
            'developer_name' => 'Dev 2',
            'voted_hours' => 20,
        ]);

        $response = $this->actingAs($user)->post(route('projects.lock', $project));

        $response->assertSessionHasErrors('consensus');
        $this->assertEquals('Awaiting Delphi', $project->refresh()->status);
    }

    public function test_can_lock_when_consensus_reached(): void
    {
        $user = User::factory()->create();
        $project = Project::create(['title' => 'Test Project', 'status' => 'Awaiting Delphi']);

        $component1 = WbsComponent::create([
            'project_id' => $project->id,
            'name' => 'Component 1',
            'component_type' => 'UI',
            'best_case_hours' => 5,
            'most_likely_hours' => 10,
            'worst_case_hours' => 20,
            'computed_pert_effort' => 11,
        ]);

        $component2 = WbsComponent::create([
            'project_id' => $project->id,
            'name' => 'Component 2',
            'component_type' => 'API',
            'best_case_hours' => 2,
            'most_likely_hours' => 5,
            'worst_case_hours' => 10,
            'computed_pert_effort' => 5,
        ]);

        // Component 1 votes (Low variance: (11-10)/10 = 10% < 15%)
        DelphiVote::create(['wbs_component_id' => $component1->id, 'developer_name' => 'Dev 1', 'voted_hours' => 10]);
        DelphiVote::create(['wbs_component_id' => $component1->id, 'developer_name' => 'Dev 2', 'voted_hours' => 11]);

        // Component 2 votes (Identical: variance 0%)
        DelphiVote::create(['wbs_component_id' => $component2->id, 'developer_name' => 'Dev 1', 'voted_hours' => 5]);
        DelphiVote::create(['wbs_component_id' => $component2->id, 'developer_name' => 'Dev 2', 'voted_hours' => 5]);

        $response = $this->actingAs($user)->post(route('projects.lock', $project));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $project->refresh();
        $this->assertEquals('Locked', $project->status);
        // 11 + 5 = 16
        $this->assertEquals(16, $project->final_estimated_hours);
    }
}
