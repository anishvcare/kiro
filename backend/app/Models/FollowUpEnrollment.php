<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FollowUpEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'sequence_id',
        'contact_id',
        'conversation_id',
        'current_step',
        'status',
        'next_send_at',
    ];

    protected $casts = [
        'next_send_at' => 'datetime',
    ];

    public function sequence()
    {
        return $this->belongsTo(FollowUpSequence::class, 'sequence_id');
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }
}
