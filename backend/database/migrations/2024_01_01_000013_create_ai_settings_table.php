<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_chatbot_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('name')->default('AI Assistant');
            $table->text('system_prompt')->nullable();
            $table->text('knowledge_base')->nullable();
            $table->string('model')->default('gpt-4o-mini');
            $table->float('temperature')->default(0.7);
            $table->integer('max_tokens')->default(500);
            $table->boolean('is_active')->default(false);
            $table->json('triggers')->nullable(); // when to activate AI
            $table->json('excluded_keywords')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_chat_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->text('user_message');
            $table->text('ai_response');
            $table->integer('tokens_used')->default(0);
            $table->float('response_time')->default(0); // seconds
            $table->timestamps();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('ai_chat_logs');
        Schema::dropIfExists('ai_chatbot_settings');
    }
};
