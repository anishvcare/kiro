<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'in:male,female'],
            'date_of_birth' => ['required', 'date', 'before:-18 years'],
            'profile_for' => ['nullable', 'in:self,son,daughter,brother,sister,relative,friend'],
            'religion' => ['nullable', 'string', 'max:100'],
            'caste' => ['nullable', 'string', 'max:100'],
            'mother_tongue' => ['nullable', 'string', 'max:100'],
            'star' => ['nullable', 'string', 'max:100'],
            'rasi' => ['nullable', 'string', 'max:100'],
            'marital_status' => ['nullable', 'in:never_married,divorced,widowed,separated'],
            'height_cm' => ['nullable', 'integer', 'min:120', 'max:240'],
            'diet' => ['nullable', 'in:vegetarian,non_vegetarian,eggetarian,vegan'],
            'education' => ['nullable', 'string', 'max:255'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'annual_income' => ['nullable', 'integer', 'min:0'],
            'country' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'about' => ['nullable', 'string', 'max:2000'],
            'looking_for' => ['nullable', 'in:male,female'],
            'photo_url' => ['nullable', 'url', 'max:500'],
        ];
    }
}
