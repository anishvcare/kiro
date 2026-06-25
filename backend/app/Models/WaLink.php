<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WaLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'name',
        'short_code',
        'whatsapp_number',
        'pre_filled_message',
        'clicks_count',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function getFullUrlAttribute(): string
    {
        return url("/wa/{$this->short_code}");
    }
}
