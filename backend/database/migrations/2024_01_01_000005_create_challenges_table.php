<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('challenges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('current_day')->default(1);
            $table->integer('total_days')->default(30);
            $table->integer('tests_completed')->default(0);
            $table->decimal('average_score', 5, 2)->default(0);
            $table->decimal('pass_percentage', 5, 2)->default(60);
            $table->boolean('is_completed')->default(false);
            $table->boolean('grand_mock_unlocked')->default(false);
            $table->enum('status', ['active', 'completed', 'failed', 'abandoned'])->default('active');
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        Schema::create('challenge_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained()->onDelete('cascade');
            $table->integer('day_number');
            $table->date('date');
            $table->boolean('test_completed')->default(false);
            $table->decimal('score', 5, 2)->nullable();
            $table->boolean('passed')->default(false);
            $table->foreignId('test_attempt_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();

            $table->unique(['challenge_id', 'day_number']);
            $table->index(['challenge_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('challenge_days');
        Schema::dropIfExists('challenges');
    }
};
