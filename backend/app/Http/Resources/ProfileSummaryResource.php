<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Compact profile representation for browse/search listings.
 */
class ProfileSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'display_id' => $this->display_id,
            'full_name' => $this->full_name,
            'age' => $this->age,
            'gender' => $this->gender,
            'religion' => $this->religion,
            'caste' => $this->caste,
            'mother_tongue' => $this->mother_tongue,
            'marital_status' => $this->marital_status,
            'height_cm' => $this->height_cm,
            'education' => $this->education,
            'occupation' => $this->occupation,
            'district' => $this->district,
            'city' => $this->city,
            'country' => $this->country,
            'photo_url' => $this->photo_url,
            'is_verified' => $this->is_verified,
        ];
    }
}
