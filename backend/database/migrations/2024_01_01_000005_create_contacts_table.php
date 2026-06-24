<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('phone')->index();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('place')->nullable();
            $table->string('avatar')->nullable();
            $table->json('tags')->nullable();
            $table->json('custom_fields')->nullable();
            $table->text('notes')->nullable();
            $table->string('source')->nullable(); // whatsapp, landing_page, referral, manual
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['team_id', 'phone']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
