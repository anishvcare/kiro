<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        Schema::create('push_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->enum('type', ['challenge', 'streak', 'mock', 'general', 'promotion'])->default('general');
            $table->enum('target', ['all', 'premium', 'free', 'specific'])->default('all');
            $table->json('target_user_ids')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->boolean('is_sent')->default(false);
            $table->integer('sent_count')->default(0);
            $table->timestamps();
        });

        Schema::create('user_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('fcm_token')->unique();
            $table->string('platform')->nullable(); // android, ios, web
            $table->string('device_name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_devices');
        Schema::dropIfExists('push_notifications');
        Schema::dropIfExists('notifications');
    }
};
