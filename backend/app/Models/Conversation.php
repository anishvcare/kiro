<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'whatsapp_account_id',
        'contact_id',
        'assigned_to',
        'folder',
        'status',
        'last_message',
        'last_message_at',
        'is_unread',
        'unread_count',
    ];

    protected $casts = [
        'is_unread' => 'boolean',
        'last_message_at' => 'datetime',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function whatsappAccount()
    {
        return $this->belongsTo(WhatsappAccount::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }
}
