<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyAnalytics extends Model
{
    use HasFactory;

    protected $table = 'daily_analytics';

    protected $fillable = [
        'user_id',
        'date',
        'tests_completed',
        'questions_attempted',
        'correct_answers',
        'accuracy',
        'time_spent_seconds',
        'score',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'accuracy' => 'decimal:2',
            'score' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
