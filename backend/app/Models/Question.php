<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Question extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'subject_id',
        'topic_id',
        'subtopic_id',
        'question_text',
        'question_type',
        'options',
        'correct_option',
        'explanation',
        'reference',
        'learning_point',
        'difficulty',
        'image_url',
        'tags',
        'status',
        'times_attempted',
        'times_correct',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'tags' => 'array',
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

    public function subtopic()
    {
        return $this->belongsTo(Subtopic::class);
    }

    public function userAnswers()
    {
        return $this->hasMany(UserAnswer::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeBySubject($query, $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    public function scopeByTopic($query, $topicId)
    {
        return $query->where('topic_id', $topicId);
    }

    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    // Get accuracy rate
    public function getAccuracyRateAttribute(): float
    {
        if ($this->times_attempted === 0) return 0;
        return round(($this->times_correct / $this->times_attempted) * 100, 2);
    }
}
