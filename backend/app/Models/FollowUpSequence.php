<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FollowUpSequence extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function steps()
    {
        return $this->hasMany(FollowUpStep::class, 'sequence_id')->orderBy('sort_order');
    }

    public function enrollments()
    {
        return $this->hasMany(FollowUpEnrollment::class, 'sequence_id');
    }
}
