<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WhatsappAccount extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'team_id',
        'instance_name',
        'phone_number',
        'display_name',
        'status',
        'qr_code',
        'webhook_url',
        'settings',
        'connected_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'connected_at' => 'datetime',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }

    public function isConnected(): bool
    {
        return $this->status === 'connected';
    }
}
