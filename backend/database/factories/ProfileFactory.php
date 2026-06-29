<?php

namespace Database\Factories;

use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Profile>
 */
class ProfileFactory extends Factory
{
    protected $model = Profile::class;

    public function definition(): array
    {
        $gender = fake()->randomElement(['male', 'female']);
        $first = $gender === 'male' ? fake()->firstNameMale() : fake()->firstNameFemale();

        $religions = ['Hindu', 'Christian', 'Muslim'];
        $hinduCastes = ['Nair', 'Ezhava', 'Menon', 'Namboothiri', 'Nadar'];
        $christianCastes = ['Syrian Catholic', 'Latin Catholic', 'Marthoma', 'Jacobite'];
        $muslimCastes = ['Sunni', 'Mappila'];

        $religion = fake()->randomElement($religions);
        $caste = match ($religion) {
            'Hindu' => fake()->randomElement($hinduCastes),
            'Christian' => fake()->randomElement($christianCastes),
            default => fake()->randomElement($muslimCastes),
        };

        $districts = [
            'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
            'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
            'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
        ];

        $educations = ['B.Tech', 'B.Com', 'MBA', 'MBBS', 'B.Sc Nursing', 'M.Tech', 'CA', 'BA', 'Diploma'];
        $occupations = ['Software Engineer', 'Teacher', 'Doctor', 'Nurse', 'Accountant', 'Business', 'Govt Employee', 'Banker'];

        return [
            'display_id' => 'NM'.fake()->unique()->numerify('######'),
            'full_name' => $first.' '.fake()->lastName(),
            'gender' => $gender,
            'date_of_birth' => fake()->dateTimeBetween('-38 years', '-23 years')->format('Y-m-d'),
            'profile_for' => 'self',
            'religion' => $religion,
            'caste' => $caste,
            'mother_tongue' => 'Malayalam',
            'marital_status' => fake()->randomElement(['never_married', 'never_married', 'never_married', 'divorced']),
            'height_cm' => fake()->numberBetween(150, 185),
            'diet' => fake()->randomElement(['vegetarian', 'non_vegetarian', 'eggetarian']),
            'education' => fake()->randomElement($educations),
            'occupation' => fake()->randomElement($occupations),
            'annual_income' => fake()->numberBetween(3, 30) * 100000,
            'country' => fake()->randomElement(['India', 'India', 'India', 'United Arab Emirates', 'United States']),
            'state' => 'Kerala',
            'district' => fake()->randomElement($districts),
            'city' => fake()->city(),
            'about' => fake()->sentence(14),
            'looking_for' => $gender === 'male' ? 'female' : 'male',
            'photo_url' => null,
            'is_verified' => fake()->boolean(60),
            'completeness' => fake()->numberBetween(70, 100),
        ];
    }
}
