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
        Schema::table('delphi_votes', function (Blueprint $table) {
            $table->decimal('best_case_hours', 8, 2)->default(0)->after('developer_name');
            $table->decimal('most_likely_hours', 8, 2)->default(0)->after('best_case_hours');
            $table->decimal('worst_case_hours', 8, 2)->default(0)->after('most_likely_hours');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('delphi_votes', function (Blueprint $table) {
            //
        });
    }
};
