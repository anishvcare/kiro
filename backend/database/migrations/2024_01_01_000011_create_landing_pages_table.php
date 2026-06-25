<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landing_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('template')->default('default'); // mbbs, russia_job, ielts, custom
            $table->json('content')->nullable(); // page builder content blocks
            $table->json('settings')->nullable(); // colors, fonts, whatsapp number, etc
            $table->string('whatsapp_number')->nullable();
            $table->text('pre_filled_message')->nullable();
            $table->boolean('is_published')->default(false);
            $table->integer('views_count')->default(0);
            $table->integer('clicks_count')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('wa_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('short_code')->unique();
            $table->string('whatsapp_number');
            $table->text('pre_filled_message')->nullable();
            $table->integer('clicks_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wa_links');
        Schema::dropIfExists('landing_pages');
    }
};
