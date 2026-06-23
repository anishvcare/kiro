<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leaderboard_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('total_score')->default(0);
            $table->integer('tests_completed')->default(0);
            $table->decimal('accuracy', 5, 2)->default(0);
            $table->integer('streak_count')->default(0);
            $table->enum('period', ['weekly', 'monthly', 'all_time'])->default('all_time');
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->integer('rank')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'period', 'period_start']);
            $table->index(['period', 'total_score']);
            $table->index(['rank', 'period']);
        });

        Schema::create('user_streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('current_streak')->default(0);
            $table->integer('longest_streak')->default(0);
            $table->date('last_activity_date')->nullable();
            $table->json('streak_history')->nullable(); // Last 30 days activity
            $table->timestamps();

            $table->unique('user_id');
        });

        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('icon')->nullable();
            $table->string('criteria_type'); // streak_7, streak_15, streak_30, first_80, top_10, etc.
            $table->integer('criteria_value')->default(0);
            $table->timestamps();
        });

        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('badge_id')->constrained()->onDelete('cascade');
            $table->timestamp('earned_at');
            $table->timestamps();

            $table->unique(['user_id', 'badge_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('badges');
        Schema::dropIfExists('user_streaks');
        Schema::dropIfExists('leaderboard_entries');
    }
};
