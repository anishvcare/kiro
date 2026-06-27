<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'tenant_id' => fake()->unique()->randomNumber(8),
            'name' => fake()->word(),
            'type' => fake()->randomElement(['income', 'expense']),
            'color' => fake()->hexColor(),
            'icon' => fake()->word(),
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }

    public function expense(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'expense',
        ]);
    }

    public function income(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'income',
        ]);
    }
}
