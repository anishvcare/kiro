<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('follow_up_sequences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('follow_up_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sequence_id')->constrained('follow_up_sequences')->cascadeOnDelete();
            $table->integer('delay_days');
            $table->integer('delay_hours')->default(0);
            $table->enum('message_type', ['text', 'image', 'document', 'template'])->default('text');
            $table->text('message_body');
            $table->json('media')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('follow_up_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sequence_id')->constrained('follow_up_sequences')->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->integer('current_step')->default(0);
            $table->enum('status', ['active', 'completed', 'paused', 'cancelled'])->default('active');
            $table->timestamp('next_send_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('follow_up_enrollments');
        Schema::dropIfExists('follow_up_steps');
        Schema::dropIfExists('follow_up_sequences');
    }
};
