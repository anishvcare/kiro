<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'current_day',
        'total_days',
        'tests_completed',
        'average_score',
        'pass_percentage',
        'is_completed',
        'grand_mock_unlocked',
        'status',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'is_completed' => 'boolean',
            'grand_mock_unlocked' => 'boolean',
            'average_score' => 'decimal:2',
            'pass_percentage' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function days()
    {
        return $this->hasMany(ChallengeDay::class)->orderBy('day_number');
    }

    public function checkCompletion(): bool
    {
        if ($this->tests_completed >= $this->total_days && $this->average_score >= $this->pass_percentage) {
            $this->update([
                'is_completed' => true,
                'grand_mock_unlocked' => true,
                'status' => 'completed',
                'completed_at' => now(),
            ]);
            return true;
        }
        return false;
    }
}
