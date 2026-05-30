<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'proxy_source_url',
        'status',
        'final_estimated_hours',
    ];

    /**
     * Get the WBS components for the project.
     *
     * @return HasMany<WbsComponent, $this>
     */
    public function wbsComponents(): HasMany
    {
        return $this->hasMany(WbsComponent::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'final_estimated_hours' => 'integer',
        ];
    }
}
