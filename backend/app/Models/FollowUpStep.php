<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FollowUpStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'sequence_id',
        'delay_days',
        'delay_hours',
        'message_type',
        'message_body',
        'media',
        'sort_order',
    ];

    protected $casts = [
        'media' => 'array',
    ];

    public function sequence()
    {
        return $this->belongsTo(FollowUpSequence::class, 'sequence_id');
    }
}
