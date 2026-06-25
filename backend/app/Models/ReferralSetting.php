<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferralSetting extends Model
{
    use HasFactory;

    protected $table = 'referral_settings';

    protected $fillable = [
        'team_id',
        'default_commission_rate',
        'min_payout',
        'payout_method',
        'tiers',
        'is_active',
    ];

    protected $casts = [
        'default_commission_rate' => 'decimal:2',
        'min_payout' => 'decimal:2',
        'tiers' => 'array',
        'is_active' => 'boolean',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
