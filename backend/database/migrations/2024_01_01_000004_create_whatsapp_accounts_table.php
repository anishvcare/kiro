<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('instance_name')->unique();
            $table->string('phone_number')->nullable();
            $table->string('display_name')->nullable();
            $table->enum('status', ['disconnected', 'connecting', 'connected', 'banned'])->default('disconnected');
            $table->string('qr_code')->nullable();
            $table->text('webhook_url')->nullable();
            $table->json('settings')->nullable();
            $table->timestamp('connected_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_accounts');
    }
};
