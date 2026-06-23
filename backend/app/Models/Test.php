<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'type',
        'subject_id',
        'topic_id',
        'question_count',
        'duration_minutes',
        'scheduled_date',
        'scheduled_time',
        'status',
        'question_ids',
    ];

    protected function casts(): array
    {
        return [
            'question_ids' => 'array',
            'scheduled_date' => 'date',
        ];
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function topic()
    {
        return $this->belongsTo(Topic::class);
    }

    public function attempts()
    {
        return $this->hasMany(TestAttempt::class);
    }

    public function questions()
    {
        if ($this->question_ids) {
            return Question::whereIn('id', $this->question_ids)->get();
        }
        return collect();
    }

    // Scopes
    public function scopeDaily($query)
    {
        return $query->whereIn('type', ['daily_morning', 'daily_evening']);
    }

    public function scopeToday($query)
    {
        return $query->where('scheduled_date', today());
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
