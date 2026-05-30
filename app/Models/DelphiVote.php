<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DelphiVote extends Model
{
    protected $fillable = [
        'user_id',
        'wbs_component_id',
        'developer_name',
        'best_case_hours',
        'most_likely_hours',
        'worst_case_hours',
        'voted_hours',
    ];

    /**
     * Get the user that cast the vote.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the WBS component that owns the Delphi vote.
     *
     * @return BelongsTo<WbsComponent, $this>
     */
    public function wbsComponent(): BelongsTo
    {
        return $this->belongsTo(WbsComponent::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'voted_hours' => 'integer',
        ];
    }
}
