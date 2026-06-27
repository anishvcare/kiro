<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['income', 'expense']);
            $table->decimal('amount', 12, 2);
            $table->string('description')->nullable();
            $table->date('date');
            $table->string('priority_color')->nullable();
            $table->boolean('is_recurring')->default(false);
            $table->string('recurring_frequency')->nullable();
            $table->date('next_due_date')->nullable();
            $table->boolean('is_bill')->default(false);
            $table->date('bill_due_date')->nullable();
            $table->enum('status', ['paid', 'pending', 'overdue'])->default('paid');
            $table->timestamps();

            $table->index(['tenant_id', 'type']);
            $table->index(['tenant_id', 'date']);
            $table->index(['tenant_id', 'is_bill', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
