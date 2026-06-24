<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChallengeDay extends Model
{
    use HasFactory;

    protected $fillable = [
        'challenge_id',
        'day_number',
        'date',
        'test_completed',
        'score',
        'passed',
        'test_attempt_id',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'test_completed' => 'boolean',
            'passed' => 'boolean',
            'score' => 'decimal:2',
        ];
    }

    public function challenge()
    {
        return $this->belongsTo(Challenge::class);
    }

    public function testAttempt()
    {
        return $this->belongsTo(TestAttempt::class);
    }
}
