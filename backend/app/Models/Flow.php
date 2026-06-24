<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Flow extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'team_id',
        'name',
        'description',
        'trigger_type',
        'trigger_keywords',
        'nodes',
        'edges',
        'is_active',
        'executions_count',
    ];

    protected $casts = [
        'trigger_keywords' => 'array',
        'nodes' => 'array',
        'edges' => 'array',
        'is_active' => 'boolean',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function sessions()
    {
        return $this->hasMany(FlowSession::class);
    }

    public function keywordAutomations()
    {
        return $this->hasMany(KeywordAutomation::class);
    }
}
