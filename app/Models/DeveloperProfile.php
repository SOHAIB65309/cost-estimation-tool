<?php

namespace App\Models;

use Database\Factories\DeveloperProfileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeveloperProfile extends Model
{
    /** @use HasFactory<DeveloperProfileFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'role',
        'weekly_loc_capacity',
        'capability_multiplier',
    ];

    /**
     * Get the user that owns the developer profile.
     */
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'weekly_loc_capacity' => 'integer',
            'capability_multiplier' => 'decimal:2',
        ];
    }
}
