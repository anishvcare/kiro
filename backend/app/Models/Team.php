<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Team extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'plan',
        'settings',
        'trial_ends_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'trial_ends_at' => 'datetime',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function whatsappAccounts()
    {
        return $this->hasMany(WhatsappAccount::class);
    }

    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    public function flows()
    {
        return $this->hasMany(Flow::class);
    }

    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }

    public function landingPages()
    {
        return $this->hasMany(LandingPage::class);
    }

    public function pipelines()
    {
        return $this->hasMany(LeadPipeline::class);
    }

    public function businessModules()
    {
        return $this->hasMany(BusinessModule::class);
    }

    public function aiChatbotSettings()
    {
        return $this->hasOne(AiChatbotSetting::class);
    }

    public function referralSettings()
    {
        return $this->hasOne(ReferralSetting::class);
    }
}
