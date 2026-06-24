<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'team_id',
        'contact_id',
        'stage_id',
        'assigned_to',
        'title',
        'value',
        'course_interest',
        'budget',
        'priority',
        'status',
        'notes',
        'custom_fields',
        'last_activity_at',
        'won_at',
        'lost_at',
    ];

    protected $casts = [
        'custom_fields' => 'array',
        'value' => 'decimal:2',
        'last_activity_at' => 'datetime',
        'won_at' => 'datetime',
        'lost_at' => 'datetime',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function stage()
    {
        return $this->belongsTo(LeadStage::class, 'stage_id');
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function referral()
    {
        return $this->hasOne(Referral::class);
    }
}
