<?php

namespace App\Http\Controllers;

use App\Models\DeveloperProfile;
use App\Models\Project;
use App\Models\WbsComponent;
use App\Services\EstimationEngine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Finalize the Delphi consensus and lock the project.
     */
    public function lockConsensus(Project $project): RedirectResponse
    {
        $project->load('wbsComponents.delphiVotes');

        foreach ($project->wbsComponents as $component) {
            $votes = $component->delphiVotes;

            if ($votes->count() < 2) {
                return back()->withErrors(['consensus' => "Consensus not reached: '{$component->name}' has only {$votes->count()} votes."]);
            }

            $votedHours = $votes->pluck('voted_hours');
            $min = $votedHours->min();
            $max = $votedHours->max();

            if ($min > 0) {
                $variance = ($max - $min) / $min;
                if ($variance > 0.15) {
                    return back()->withErrors(['consensus' => "Variance failure on '{$component->name}'. Min: {$min}h, Max: {$max}h"]);
                }
            } elseif ($max > 0) {
                return back()->withErrors(['consensus' => "Zero-value conflict on '{$component->name}'."]);
            }

            // --- THE UPGRADED PERT ROLLUP FIX ---
            // Average the raw inputs from all developers
            $avgBest = $votes->avg('best_case_hours');
            $avgMost = $votes->avg('most_likely_hours');
            $avgWorst = $votes->avg('worst_case_hours');
            $finalComponentEffort = $votedHours->avg();

            // Save the averaged raw data AND the calculated PERT back to the component
            $component->update([
                'best_case_hours' => $avgBest,
                'most_likely_hours' => $avgMost,
                'worst_case_hours' => $avgWorst,
                'computed_pert_effort' => $finalComponentEffort
            ]);
        }
        $project->update([
            'status' => 'Locked',
            'final_estimated_hours' => (int) round($project->wbsComponents->sum('computed_pert_effort')),
        ]);

        return back()->with('success', 'Project consensus locked successfully.');
    }

    /**
     * Display the Delphi workspace for a project.
     */
    public function delphi(Project $project): Response
    {
        $project->load(['wbsComponents.delphiVotes']);
        $developers = DeveloperProfile::all();

        return Inertia::render('project/DelphiWorkspace', [
            'project' => $project,
            'developers' => $developers,
        ]);
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(Request $request, EstimationEngine $engine): RedirectResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'proxy_source_url' => 'required|url',
        ]);

        $response = Http::post('http://127.0.0.1:8001/api/scrape', [
            'url' => $request->proxy_source_url,
        ]);

        if ($response->failed()) {
            return back()->with('error', 'Failed to scrape the provided URL.');
        }

        $counts = $response->json()['components'] ?? ['input_forms' => 0, 'ui_components' => 0, 'action_endpoints' => 0];

        $project = Project::create([
            'title' => $request->title,
            'proxy_source_url' => $request->proxy_source_url,
            'status' => 'Awaiting Delphi',
        ]);

        $mapping = [
            'input_forms' => 'Form',
            'ui_components' => 'UI',
            'action_endpoints' => 'Endpoint',
        ];

        foreach ($mapping as $key => $type) {
            WbsComponent::create([
                'project_id' => $project->id,
                'name' => "Scraped {$type}s (Count: " . ($counts[$key] ?? 0) . ")",
                'component_type' => $type,
                'best_case_hours' => 0,
                'most_likely_hours' => 0,
                'worst_case_hours' => 0,
                'computed_pert_effort' => 0,
            ]);
        }

        return redirect()->route('dashboard')->with('success', 'Project created. Components awaiting Delphi voting.');
    }
    /**
     * Add a manual component to the project.
     */
    public function addManualComponent(Request $request, Project $project, EstimationEngine $engine): RedirectResponse
    {
        // Ensure project is loaded (handles cases where Route Model Binding might be skipped in tests)
        if (!$project->exists && $request->route('project')) {
            $project = Project::findOrFail($request->route('project'));
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'component_type' => 'required|string',
            'best_case_hours' => 'required|integer|min:0',
            'most_likely_hours' => 'required|integer|min:0',
            'worst_case_hours' => 'required|integer|min:0',
        ]);

        $pert = $engine->calculatePERT(
            $validated['best_case_hours'],
            $validated['most_likely_hours'],
            $validated['worst_case_hours']
        );

        $project->wbsComponents()->create(array_merge($validated, [
            'computed_pert_effort' => $pert,
        ]));

        // Update project's final_estimated_hours by summing all component PERT efforts
        $project->update([
            'final_estimated_hours' => (int) round($project->wbsComponents()->sum('computed_pert_effort')),
        ]);

        return back()->with('success', 'Manual component added successfully.');
    }
}
