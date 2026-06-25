<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadStage extends Model
{
    use HasFactory;

    protected $fillable = ['pipeline_id', 'name', 'color', 'sort_order'];

    public function pipeline()
    {
        return $this->belongsTo(LeadPipeline::class, 'pipeline_id');
    }

    public function leads()
    {
        return $this->hasMany(Lead::class, 'stage_id');
    }
}
