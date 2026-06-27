<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'type' => ['sometimes', 'required', Rule::in(['income', 'expense'])],
            'color' => ['nullable', 'string', 'max:50'],
            'icon' => ['nullable', 'string', 'max:50'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
