<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserTopicAnalytics extends Model
{
    use HasFactory;

    protected $table = 'user_topic_analytics';

    protected $fillable = [
        'user_id',
        'topic_id',
        'total_questions_attempted',
        'correct_answers',
        'accuracy',
    ];

    protected function casts(): array
    {
        return [
            'accuracy' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function topic()
    {
        return $this->belongsTo(Topic::class);
    }
}
