<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tests', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('type', ['daily_morning', 'daily_evening', 'practice', 'grand_mock']);
            $table->foreignId('subject_id')->nullable()->constrained()->onDelete('set null');
            $table->unsignedBigInteger('topic_id')->nullable();
            $table->integer('question_count')->default(30);
            $table->integer('duration_minutes')->default(30);
            $table->date('scheduled_date')->nullable();
            $table->time('scheduled_time')->nullable();
            $table->enum('status', ['upcoming', 'active', 'completed'])->default('upcoming');
            $table->json('question_ids')->nullable(); // Pre-selected questions
            $table->timestamps();

            $table->foreign('topic_id')->references('id')->on('topics')->onDelete('set null');
            $table->index(['type', 'scheduled_date']);
            $table->index(['status', 'type']);
        });

        Schema::create('test_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('score')->default(0);
            $table->integer('total_questions');
            $table->integer('correct_answers')->default(0);
            $table->integer('wrong_answers')->default(0);
            $table->integer('skipped')->default(0);
            $table->decimal('percentage', 5, 2)->default(0);
            $table->integer('time_taken_seconds')->default(0);
            $table->integer('rank')->nullable();
            $table->enum('status', ['in_progress', 'completed', 'abandoned'])->default('in_progress');
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['test_id', 'status']);
            $table->index(['user_id', 'completed_at']);
        });

        Schema::create('user_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_attempt_id')->constrained()->onDelete('cascade');
            $table->foreignId('question_id')->constrained()->onDelete('cascade');
            $table->string('selected_option', 1)->nullable();
            $table->boolean('is_correct')->default(false);
            $table->integer('time_taken_seconds')->default(0);
            $table->boolean('is_marked_for_review')->default(false);
            $table->timestamps();

            $table->unique(['test_attempt_id', 'question_id']);
            $table->index(['question_id', 'is_correct']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_answers');
        Schema::dropIfExists('test_attempts');
        Schema::dropIfExists('tests');
    }
};
