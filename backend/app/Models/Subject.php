<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'question_weight',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function topics()
    {
        return $this->hasMany(Topic::class)->orderBy('sort_order');
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function activeQuestions()
    {
        return $this->hasMany(Question::class)->where('status', 'active');
    }

    public function getQuestionCountAttribute(): int
    {
        return $this->activeQuestions()->count();
    }
}
