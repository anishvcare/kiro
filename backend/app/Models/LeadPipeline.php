<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadPipeline extends Model
{
    use HasFactory;

    protected $fillable = ['team_id', 'name', 'sort_order'];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function stages()
    {
        return $this->hasMany(LeadStage::class, 'pipeline_id')->orderBy('sort_order');
    }
}
