<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LandingPage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'team_id',
        'title',
        'slug',
        'description',
        'template',
        'content',
        'settings',
        'whatsapp_number',
        'pre_filled_message',
        'is_published',
        'views_count',
        'clicks_count',
    ];

    protected $casts = [
        'content' => 'array',
        'settings' => 'array',
        'is_published' => 'boolean',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
