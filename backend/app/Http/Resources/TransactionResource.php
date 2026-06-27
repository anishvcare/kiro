<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'category_id' => $this->category_id,
            'type' => $this->type,
            'amount' => $this->amount,
            'description' => $this->description,
            'date' => $this->date?->format('Y-m-d'),
            'priority_color' => $this->priority_color,
            'is_recurring' => $this->is_recurring,
            'recurring_frequency' => $this->recurring_frequency,
            'next_due_date' => $this->next_due_date?->format('Y-m-d'),
            'is_bill' => $this->is_bill,
            'bill_due_date' => $this->bill_due_date?->format('Y-m-d'),
            'status' => $this->status,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
