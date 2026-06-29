<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

/**
 * Removes the legacy personal-finance tables. The app was repurposed into a
 * matrimony platform; these tables are no longer used. Safe on fresh installs
 * (dropIfExists is a no-op when the tables don't exist).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('categories');
    }

    public function down(): void
    {
        // No-op: legacy finance tables are intentionally not recreated.
    }
};
