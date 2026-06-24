<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSubjectAnalytics extends Model
{
    use HasFactory;

    protected $table = 'user_subject_analytics';

    protected $fillable = [
        'user_id',
        'subject_id',
        'total_questions_attempted',
        'correct_answers',
        'accuracy',
        'total_time_seconds',
        'average_time_per_question',
    ];

    protected function casts(): array
    {
        return [
            'accuracy' => 'decimal:2',
            'average_time_per_question' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function recalculate(): void
    {
        if ($this->total_questions_attempted > 0) {
            $this->accuracy = ($this->correct_answers / $this->total_questions_attempted) * 100;
            $this->average_time_per_question = $this->total_time_seconds / $this->total_questions_attempted;
        }
        $this->save();
    }
}
