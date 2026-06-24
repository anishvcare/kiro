<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('referrer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', ['pending', 'qualified', 'converted', 'paid'])->default('pending');
            $table->decimal('commission_amount', 10, 2)->nullable();
            $table->decimal('commission_rate', 5, 2)->default(0);
            $table->timestamp('converted_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('referral_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->decimal('default_commission_rate', 5, 2)->default(10.00);
            $table->decimal('min_payout', 10, 2)->default(100.00);
            $table->string('payout_method')->default('bank_transfer');
            $table->json('tiers')->nullable(); // tier-based commission rates
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referral_settings');
        Schema::dropIfExists('referrals');
    }
};
