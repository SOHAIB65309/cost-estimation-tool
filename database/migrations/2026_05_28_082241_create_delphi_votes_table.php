<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('delphi_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wbs_component_id')->constrained()->cascadeOnDelete();
            $table->string('developer_name');
            $table->decimal('voted_hours', 8, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delphi_votes');
    }
};
