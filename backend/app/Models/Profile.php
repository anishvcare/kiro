<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'display_id',
        'full_name',
        'gender',
        'date_of_birth',
        'profile_for',
        'religion',
        'caste',
        'mother_tongue',
        'star',
        'rasi',
        'marital_status',
        'height_cm',
        'diet',
        'education',
        'occupation',
        'annual_income',
        'country',
        'state',
        'district',
        'city',
        'about',
        'looking_for',
        'photo_url',
        'is_verified',
        'completeness',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'is_verified' => 'boolean',
            'height_cm' => 'integer',
            'annual_income' => 'integer',
            'completeness' => 'integer',
        ];
    }

    /**
     * Age in whole years, derived from date_of_birth.
     */
    public function getAgeAttribute(): ?int
    {
        return $this->date_of_birth?->age;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(ProfilePhoto::class);
    }

    /**
     * Compute a 0-100 profile completeness score from key fields.
     */
    public function calculateCompleteness(): int
    {
        $fields = [
            'full_name', 'gender', 'date_of_birth', 'religion', 'caste',
            'marital_status', 'height_cm', 'education', 'occupation',
            'district', 'about', 'looking_for', 'photo_url',
        ];

        $filled = 0;
        foreach ($fields as $field) {
            if (! empty($this->{$field})) {
                $filled++;
            }
        }

        return (int) round(($filled / count($fields)) * 100);
    }
}
