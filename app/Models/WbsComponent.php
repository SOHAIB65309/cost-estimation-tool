<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WbsComponent extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'name',
        'component_type',
        'best_case_hours',
        'most_likely_hours',
        'worst_case_hours',
        'computed_pert_effort',
    ];

    /**
     * Get the project that owns the WBS component.
     *
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the Delphi votes for the WBS component.
     *
     * @return HasMany<DelphiVote, $this>
     */
    public function delphiVotes(): HasMany
    {
        return $this->hasMany(DelphiVote::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'best_case_hours' => 'integer',
            'most_likely_hours' => 'integer',
            'worst_case_hours' => 'integer',
            'computed_pert_effort' => 'decimal:2',
        ];
    }
}
