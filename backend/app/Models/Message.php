<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'contact_id',
        'user_id',
        'whatsapp_message_id',
        'type',
        'direction',
        'body',
        'media',
        'metadata',
        'status',
        'is_from_bot',
        'sent_at',
    ];

    protected $casts = [
        'media' => 'array',
        'metadata' => 'array',
        'is_from_bot' => 'boolean',
        'sent_at' => 'datetime',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
