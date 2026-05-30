<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wbs_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('component_type');
            // Change these to decimal as well:
            $table->decimal('best_case_hours', 8, 2)->default(0);
            $table->decimal('most_likely_hours', 8, 2)->default(0);
            $table->decimal('worst_case_hours', 8, 2)->default(0);
            $table->decimal('computed_pert_effort', 8, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wbs_components');
    }
};
