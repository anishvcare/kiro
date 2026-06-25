<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiChatbotSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'name',
        'system_prompt',
        'knowledge_base',
        'model',
        'temperature',
        'max_tokens',
        'is_active',
        'triggers',
        'excluded_keywords',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'triggers' => 'array',
        'excluded_keywords' => 'array',
        'temperature' => 'float',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
