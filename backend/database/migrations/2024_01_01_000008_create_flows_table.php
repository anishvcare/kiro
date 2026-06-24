<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('trigger_type', ['keyword', 'new_contact', 'webhook', 'manual'])->default('keyword');
            $table->json('trigger_keywords')->nullable();
            $table->json('nodes')->nullable(); // Flow builder nodes
            $table->json('edges')->nullable(); // Flow builder edges
            $table->boolean('is_active')->default(true);
            $table->integer('executions_count')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('flow_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flow_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->string('current_node_id')->nullable();
            $table->json('data')->nullable(); // collected data from the flow
            $table->enum('status', ['active', 'completed', 'expired', 'cancelled'])->default('active');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('keyword_automations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('keyword');
            $table->enum('match_type', ['exact', 'contains', 'starts_with'])->default('contains');
            $table->enum('response_type', ['text', 'image', 'document', 'flow'])->default('text');
            $table->text('response_text')->nullable();
            $table->json('response_media')->nullable();
            $table->foreignId('flow_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->integer('triggered_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('keyword_automations');
        Schema::dropIfExists('flow_sessions');
        Schema::dropIfExists('flows');
    }
};
