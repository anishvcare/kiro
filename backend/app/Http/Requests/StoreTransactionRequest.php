<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where('tenant_id', $this->user()->tenant_id)],
            'type' => ['required', Rule::in(['income', 'expense'])],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:500'],
            'date' => ['required', 'date'],
            'priority_color' => ['nullable', 'string', 'max:50'],
            'is_recurring' => ['boolean'],
            'recurring_frequency' => ['nullable', 'string', Rule::in(['daily', 'weekly', 'monthly', 'yearly'])],
            'next_due_date' => ['nullable', 'date'],
            'is_bill' => ['boolean'],
            'bill_due_date' => ['nullable', 'date'],
            'status' => ['nullable', Rule::in(['paid', 'pending', 'overdue'])],
        ];
    }
}
