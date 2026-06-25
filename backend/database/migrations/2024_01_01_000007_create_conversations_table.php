<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('whatsapp_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('folder', ['new_leads', 'interested', 'follow_up', 'converted', 'closed'])->default('new_leads');
            $table->enum('status', ['open', 'pending', 'resolved'])->default('open');
            $table->text('last_message')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->boolean('is_unread')->default(true);
            $table->integer('unread_count')->default(0);
            $table->timestamps();

            $table->unique(['whatsapp_account_id', 'contact_id']);
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('whatsapp_message_id')->nullable()->index();
            $table->enum('type', ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'sticker', 'button', 'list', 'template'])->default('text');
            $table->enum('direction', ['inbound', 'outbound'])->default('inbound');
            $table->text('body')->nullable();
            $table->json('media')->nullable(); // url, mime_type, filename, size
            $table->json('metadata')->nullable(); // buttons, list items, etc
            $table->enum('status', ['pending', 'sent', 'delivered', 'read', 'failed'])->default('pending');
            $table->boolean('is_from_bot')->default(false);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversations');
    }
};
