<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'google_id',
        'avatar',
        'role',
        'university',
        'country',
        'subscription_plan',
        'subscription_expires_at',
        'streak_count',
        'last_activity_date',
        'total_tests_completed',
        'average_score',
        'fcm_token',
        'device_platform',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
        'fcm_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'subscription_expires_at' => 'datetime',
            'last_activity_date' => 'date',
            'password' => 'hashed',
            'average_score' => 'decimal:2',
        ];
    }

    // Relationships
    public function testAttempts()
    {
        return $this->hasMany(TestAttempt::class);
    }

    public function challenges()
    {
        return $this->hasMany(Challenge::class);
    }

    public function activeChallenge()
    {
        return $this->hasOne(Challenge::class)->where('status', 'active');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->where('status', 'active')->where('expires_at', '>', now());
    }

    public function subjectAnalytics()
    {
        return $this->hasMany(UserSubjectAnalytics::class);
    }

    public function topicAnalytics()
    {
        return $this->hasMany(UserTopicAnalytics::class);
    }

    public function dailyAnalytics()
    {
        return $this->hasMany(DailyAnalytics::class);
    }

    public function streak()
    {
        return $this->hasOne(UserStreak::class);
    }

    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'user_badges')->withPivot('earned_at');
    }

    public function devices()
    {
        return $this->hasMany(UserDevice::class);
    }

    public function leaderboardEntries()
    {
        return $this->hasMany(LeaderboardEntry::class);
    }

    // Helpers
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isPremium(): bool
    {
        return $this->subscription_plan === 'premium' &&
            $this->subscription_expires_at &&
            $this->subscription_expires_at->isFuture();
    }

    public function hasGrandMockAccess(): bool
    {
        $completedChallenge = $this->challenges()->where('is_completed', true)->exists();
        return $this->isPremium() || $completedChallenge;
    }
}
