<?php

namespace Database\Seeders;

use App\Models\DelphiVote;
use App\Models\Project;
use App\Models\WbsComponent;
use App\Services\EstimationEngine;
use Illuminate\Database\Seeder;

class EstimationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $engine = new EstimationEngine;

        // 1. E-Commerce Migration (Locked) - Identical Votes
        $ecommerce = Project::create([
            'title' => 'E-Commerce Migration',
            'proxy_source_url' => 'https://github.com/example/ecommerce-v2',
            'status' => 'Locked',
            'final_estimated_hours' => 120,
        ]);

        $this->createComponentsWithVotes($ecommerce, [
            ['name' => 'Product Catalog API', 'type' => 'Endpoint', 'o' => 20, 'm' => 30, 'p' => 50],
            ['name' => 'Checkout Flow', 'type' => 'Form', 'o' => 15, 'm' => 25, 'p' => 45],
            ['name' => 'User Dashboard', 'type' => 'UI', 'o' => 10, 'm' => 20, 'p' => 40],
        ], $engine, true);

        // 2. CRM Redashboarding (Voting)
        $crm = Project::create([
            'title' => 'CRM Redashboarding',
            'proxy_source_url' => null,
            'status' => 'Voting',
        ]);

        $this->createComponentsWithVotes($crm, [
            ['name' => 'Analytics Widgets', 'type' => 'UI', 'o' => 12, 'm' => 18, 'p' => 30],
            ['name' => 'Data Export Service', 'type' => 'Endpoint', 'o' => 8, 'm' => 12, 'p' => 20],
            ['name' => 'Settings Panel', 'type' => 'Form', 'o' => 5, 'm' => 10, 'p' => 15],
        ], $engine);

        // 3. Fintech Payment Gateway (Voting) - High Variance Votes (>15%)
        $fintech = Project::create([
            'title' => 'Fintech Payment Gateway',
            'proxy_source_url' => 'https://api.docs.fintech-example.com',
            'status' => 'Voting',
        ]);

        $this->createComponentsWithVotes($fintech, [
            ['name' => 'PCI Compliance Handler', 'type' => 'Endpoint', 'o' => 40, 'm' => 60, 'p' => 100],
            ['name' => 'Payment Intent UI', 'type' => 'UI', 'o' => 20, 'm' => 35, 'p' => 60],
            ['name' => 'Kyc Verification Form', 'type' => 'Form', 'o' => 15, 'm' => 30, 'p' => 50],
        ], $engine, false, true);
    }

    /**
     * Helper to create components and their votes.
     */
    private function createComponentsWithVotes(Project $project, array $components, EstimationEngine $engine, bool $identical = false, bool $highVariance = false): void
    {
        foreach ($components as $data) {
            $component = WbsComponent::create([
                'project_id' => $project->id,
                'name' => $data['name'],
                'component_type' => $data['type'],
                'best_case_hours' => $data['o'],
                'most_likely_hours' => $data['m'],
                'worst_case_hours' => $data['p'],
                'computed_pert_effort' => $engine->calculatePERT($data['o'], $data['m'], $data['p']),
            ]);

            if ($identical) {
                DelphiVote::create(['wbs_component_id' => $component->id, 'developer_name' => 'Alice', 'voted_hours' => $data['m']]);
                DelphiVote::create(['wbs_component_id' => $component->id, 'developer_name' => 'Bob', 'voted_hours' => $data['m']]);
            } elseif ($highVariance) {
                // Votes with > 15% discrepancy (e.g., m=60, votes 50 and 75)
                DelphiVote::create(['wbs_component_id' => $component->id, 'developer_name' => 'Alice', 'voted_hours' => round($data['m'] * 0.8)]);
                DelphiVote::create(['wbs_component_id' => $component->id, 'developer_name' => 'Bob', 'voted_hours' => round($data['m'] * 1.3)]);
            } else {
                DelphiVote::create(['wbs_component_id' => $component->id, 'developer_name' => 'Alice', 'voted_hours' => $data['m']]);
                DelphiVote::create(['wbs_component_id' => $component->id, 'developer_name' => 'Bob', 'voted_hours' => round($data['m'] * 1.1)]);
            }
        }
    }
}
