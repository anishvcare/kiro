<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_id',
        'user_id',
        'score',
        'total_questions',
        'correct_answers',
        'wrong_answers',
        'skipped',
        'percentage',
        'time_taken_seconds',
        'rank',
        'status',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'percentage' => 'decimal:2',
        ];
    }

    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function answers()
    {
        return $this->hasMany(UserAnswer::class);
    }

    // Calculate subject performance
    public function getSubjectPerformance(): array
    {
        return $this->answers()
            ->join('questions', 'user_answers.question_id', '=', 'questions.id')
            ->join('subjects', 'questions.subject_id', '=', 'subjects.id')
            ->selectRaw('subjects.id as subject_id, subjects.name as subject_name,
                COUNT(*) as total,
                SUM(CASE WHEN user_answers.is_correct = 1 THEN 1 ELSE 0 END) as correct')
            ->groupBy('subjects.id', 'subjects.name')
            ->get()
            ->map(function ($item) {
                return [
                    'subject_id' => $item->subject_id,
                    'subject_name' => $item->subject_name,
                    'total' => $item->total,
                    'correct' => $item->correct,
                    'percentage' => $item->total > 0 ? round(($item->correct / $item->total) * 100, 2) : 0,
                ];
            })
            ->toArray();
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
