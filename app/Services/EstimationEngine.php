<?php

namespace App\Services;

use App\Models\DeveloperProfile;

class EstimationEngine
{
    /**
     * Calculate the PERT (Program Evaluation and Review Technique) estimated effort.
     *
     * Formula: (Optimistic + 4 * Most Likely + Pessimistic) / 6
     */
    public function calculatePERT(int $optimistic, int $mostLikely, int $pessimistic): float
    {
        return ($optimistic + (4 * $mostLikely) + $pessimistic) / 6;
    }

    /**
     * Calculate the standard deviation for the estimate.
     *
     * Formula: (Pessimistic - Optimistic) / 6
     */
    public function calculateStandardDeviation(int $optimistic, int $mostLikely, int $pessimistic): float
    {
        return ($pessimistic - $optimistic) / 6;
    }

    /**
     * Generate a smart baseline using COCOMO capability multiplier and base component hours.
     */
    public function generateSmartBaseline(string $componentType, DeveloperProfile $developer): array
    {
        $baseHours = match (strtolower($componentType)) {
            'ui' => 4,
            'endpoint' => 6,
            'form' => 2,
            default => 4,
        };

        $calculatedBase = $baseHours * $developer->capability_multiplier;

        return [
            'optimistic' => (int) round($calculatedBase * 0.8),
            'most_likely' => (int) round($calculatedBase * 1.0),
            'pessimistic' => (int) round($calculatedBase * 1.5),
        ];
    }
}
