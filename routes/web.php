<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeveloperProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\VoteController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('team', DeveloperProfileController::class)->except(['create', 'show', 'edit']);

    Route::post('projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::get('projects/{project}/delphi', [ProjectController::class, 'delphi'])->name('projects.delphi');
    Route::post('projects/{project}/lock', [ProjectController::class, 'lockConsensus'])->name('projects.lock');
    Route::post('projects/{project}/components', [ProjectController::class, 'addManualComponent'])->name('projects.components.store');
    Route::post('components/{component}/votes', [VoteController::class, 'store'])->name('votes.store');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
