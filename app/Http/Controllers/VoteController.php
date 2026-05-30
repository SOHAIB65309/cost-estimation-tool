<?php

namespace App\Http\Controllers;

use App\Models\WbsComponent;
use App\Services\EstimationEngine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class VoteController extends Controller
{
    /**
     * Store a new Delphi vote.
     */
    public function store(Request $request, WbsComponent $component, EstimationEngine $engine): RedirectResponse
    {
        $validated = $request->validate([
            'best_case_hours' => 'required|numeric|min:0',
            'most_likely_hours' => 'required|numeric|min:0',
            'worst_case_hours' => 'required|numeric|min:0',
        ]);

        $user = $request->user();

        $votedHours = $engine->calculatePERT(
            $validated['best_case_hours'],
            $validated['most_likely_hours'],
            $validated['worst_case_hours']
        );

        $component->delphiVotes()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'developer_name' => $user->name,
                'best_case_hours' => $validated['best_case_hours'],
                'most_likely_hours' => $validated['most_likely_hours'],
                'worst_case_hours' => $validated['worst_case_hours'],
                'voted_hours' => $votedHours
            ]
        );

        // Check for discrepancy if we have at least 2 votes
        $votes = $component->delphiVotes()->pluck('voted_hours');
        if ($votes->count() >= 2) {
            $min = $votes->min();
            $max = $votes->max();
            if ($min > 0) {
                $variance = ($max - $min) / $min;

                if ($variance > 0.15) {
                    session()->flash('warning', "High variance (>15%) detected for '{$component->name}'!");
                }
            }
        }

        return back()->with('success', 'Vote recorded successfully.');
    }
}
