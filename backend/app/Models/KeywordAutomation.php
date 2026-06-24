<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KeywordAutomation extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'keyword',
        'match_type',
        'response_type',
        'response_text',
        'response_media',
        'flow_id',
        'is_active',
        'triggered_count',
    ];

    protected $casts = [
        'response_media' => 'array',
        'is_active' => 'boolean',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function flow()
    {
        return $this->belongsTo(Flow::class);
    }
}
