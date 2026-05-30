<?php

namespace App\Http\Controllers;

use App\Models\DeveloperProfile;
use App\Models\Project;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        $projects = Project::with('wbsComponents')->get();
        $developers = DeveloperProfile::all();

        return Inertia::render('dashboard', [
            'projects' => $projects,
            'developers' => $developers,
        ]);
    }
}
