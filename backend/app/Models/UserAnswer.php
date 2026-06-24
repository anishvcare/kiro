<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_attempt_id',
        'question_id',
        'selected_option',
        'is_correct',
        'time_taken_seconds',
        'is_marked_for_review',
    ];

    protected function casts(): array
    {
        return [
            'is_correct' => 'boolean',
            'is_marked_for_review' => 'boolean',
        ];
    }

    public function testAttempt()
    {
        return $this->belongsTo(TestAttempt::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
