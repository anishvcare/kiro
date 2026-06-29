<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Interest extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'status',
        'message',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * The sender's profile (linked via users.id = profiles.user_id).
     */
    public function senderProfile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'sender_id', 'user_id');
    }

    /**
     * The receiver's profile.
     */
    public function receiverProfile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'receiver_id', 'user_id');
    }
}
