<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InterestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sender_id' => $this->sender_id,
            'receiver_id' => $this->receiver_id,
            'status' => $this->status,
            'message' => $this->message,
            'created_at' => $this->created_at,
            'sender_profile' => new ProfileSummaryResource($this->whenLoaded('senderProfile')),
            'receiver_profile' => new ProfileSummaryResource($this->whenLoaded('receiverProfile')),
        ];
    }
}
