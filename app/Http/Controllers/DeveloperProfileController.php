<?php

namespace App\Http\Controllers;

use App\Http\Requests\DeveloperProfileRequest;
use App\Models\DeveloperProfile;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DeveloperProfileController extends Controller
{
    /**
     * Display a listing of developer profiles.
     */
    public function index(): Response
    {
        $developers = DeveloperProfile::all();

        return Inertia::render('settings/team', [
            'developerProfiles' => $developers,
        ]);
    }

    /**
     * Store a newly created developer profile.
     */
    public function store(DeveloperProfileRequest $request): RedirectResponse
    {
        DeveloperProfile::create($request->validated());

        return back()->with('success', 'Developer profile created successfully.');
    }

    /**
     * Update the specified developer profile.
     */
    public function update(DeveloperProfileRequest $request, DeveloperProfile $team): RedirectResponse
    {
        $team->update($request->validated());

        return back()->with('success', 'Developer profile updated successfully.');
    }

    /**
     * Remove the specified developer profile.
     */
    public function destroy(DeveloperProfile $team): RedirectResponse
    {
        $team->delete();

        return back()->with('success', 'Developer profile deleted successfully.');
    }
}
