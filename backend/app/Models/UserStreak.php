<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserStreak extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'current_streak',
        'longest_streak',
        'last_activity_date',
        'streak_history',
    ];

    protected function casts(): array
    {
        return [
            'last_activity_date' => 'date',
            'streak_history' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function updateStreak(): void
    {
        $today = today();

        if ($this->last_activity_date === null || $this->last_activity_date->diffInDays($today) > 1) {
            // Streak broken
            $this->current_streak = 1;
        } elseif ($this->last_activity_date->diffInDays($today) === 1) {
            // Consecutive day
            $this->current_streak += 1;
        }
        // Same day - no change to streak

        $this->last_activity_date = $today;
        $this->longest_streak = max($this->longest_streak, $this->current_streak);
        $this->save();

        // Update user streak count
        $this->user->update(['streak_count' => $this->current_streak, 'last_activity_date' => $today]);
    }
}
