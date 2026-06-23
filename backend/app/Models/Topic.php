<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'name',
        'slug',
        'description',
        'notes',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function subtopics()
    {
        return $this->hasMany(Subtopic::class)->orderBy('sort_order');
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function activeQuestions()
    {
        return $this->hasMany(Question::class)->where('status', 'active');
    }
}
