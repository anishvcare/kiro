<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Referral extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'referrer_id',
        'contact_id',
        'lead_id',
        'status',
        'commission_amount',
        'commission_rate',
        'converted_at',
        'paid_at',
    ];

    protected $casts = [
        'commission_amount' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'converted_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
