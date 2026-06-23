<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('topic_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('subtopic_id')->nullable();
            $table->text('question_text');
            $table->enum('question_type', ['mcq', 'true_false', 'clinical_scenario', 'image_based'])->default('mcq');
            $table->json('options'); // [{key: "A", text: "..."}, ...]
            $table->string('correct_option', 1); // A, B, C, or D
            $table->text('explanation')->nullable();
            $table->string('reference')->nullable();
            $table->text('learning_point')->nullable();
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->string('image_url')->nullable();
            $table->json('tags')->nullable();
            $table->enum('status', ['active', 'inactive', 'draft'])->default('active');
            $table->integer('times_attempted')->default(0);
            $table->integer('times_correct')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('subtopic_id')->references('id')->on('subtopics')->onDelete('set null');
            $table->index(['subject_id', 'status']);
            $table->index(['topic_id', 'status']);
            $table->index(['difficulty', 'status']);
            $table->index(['question_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
