<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Full profile representation (own profile / profile detail view).
 */
class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'display_id' => $this->display_id,
            'full_name' => $this->full_name,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'age' => $this->age,
            'profile_for' => $this->profile_for,
            'religion' => $this->religion,
            'caste' => $this->caste,
            'mother_tongue' => $this->mother_tongue,
            'star' => $this->star,
            'rasi' => $this->rasi,
            'marital_status' => $this->marital_status,
            'height_cm' => $this->height_cm,
            'diet' => $this->diet,
            'education' => $this->education,
            'occupation' => $this->occupation,
            'annual_income' => $this->annual_income,
            'country' => $this->country,
            'state' => $this->state,
            'district' => $this->district,
            'city' => $this->city,
            'about' => $this->about,
            'looking_for' => $this->looking_for,
            'photo_url' => $this->photo_url,
            'is_verified' => $this->is_verified,
            'completeness' => $this->completeness,
            'photos' => ProfilePhotoResource::collection($this->whenLoaded('photos')),
            'created_at' => $this->created_at,
        ];
    }
}
