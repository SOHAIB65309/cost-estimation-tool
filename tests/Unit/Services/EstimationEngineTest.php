<?php

namespace Tests\Unit\Services;

use App\Models\DeveloperProfile;
use App\Services\EstimationEngine;
use PHPUnit\Framework\TestCase;

class EstimationEngineTest extends TestCase
{
    /**
     * Test the PERT calculation.
     */
    public function test_it_calculates_pert_correctly(): void
    {
        $engine = new EstimationEngine;

        // (10 + 4*20 + 30) / 6 = 20
        $this->assertEquals(20, $engine->calculatePERT(10, 20, 30));

        // (5 + 4*10 + 20) / 6 = 65 / 6 = 10.8333...
        $this->assertEqualsWithDelta(10.8333, $engine->calculatePERT(5, 10, 20), 0.0001);
    }

    /**
     * Test the standard deviation calculation.
     */
    public function test_it_calculates_standard_deviation_correctly(): void
    {
        $engine = new EstimationEngine;

        // (30 - 10) / 6 = 3.3333...
        $this->assertEqualsWithDelta(3.3333, $engine->calculateStandardDeviation(10, 20, 30), 0.0001);

        // (20 - 5) / 6 = 15 / 6 = 2.5
        $this->assertEquals(2.5, $engine->calculateStandardDeviation(5, 10, 20));
    }

    /**
     * Test the smart baseline generation using COCOMO capabilities.
     */
    public function test_it_generates_smart_baseline_correctly(): void
    {
        $engine = new EstimationEngine;
        $developer = new DeveloperProfile(['capability_multiplier' => 0.85]);

        // For 'UI' (base 4) * 0.85 = 3.4
        // Opt: 3.4 * 0.8 = 2.72 => 3
        // ML: 3.4 * 1.0 = 3.4 => 3
        // Pess: 3.4 * 1.5 = 5.1 => 5
        $result = $engine->generateSmartBaseline('UI', $developer);
        $this->assertEquals(['optimistic' => 3, 'most_likely' => 3, 'pessimistic' => 5], $result);

        // For 'Endpoint' (base 6) * 0.85 = 5.1
        // Opt: 5.1 * 0.8 = 4.08 => 4
        // ML: 5.1 * 1.0 = 5.1 => 5
        // Pess: 5.1 * 1.5 = 7.65 => 8
        $result = $engine->generateSmartBaseline('Endpoint', $developer);
        $this->assertEquals(['optimistic' => 4, 'most_likely' => 5, 'pessimistic' => 8], $result);
    }
}
