<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'tenant_id' => fake()->unique()->randomNumber(8),
            'user_id' => User::factory(),
            'category_id' => null,
            'type' => fake()->randomElement(['income', 'expense']),
            'amount' => fake()->randomFloat(2, 10, 5000),
            'description' => fake()->sentence(),
            'date' => fake()->dateTimeBetween('-30 days', 'now'),
            'priority_color' => null,
            'is_recurring' => false,
            'recurring_frequency' => null,
            'next_due_date' => null,
            'is_bill' => false,
            'bill_due_date' => null,
            'status' => 'paid',
        ];
    }

    public function bill(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_bill' => true,
            'bill_due_date' => fake()->dateTimeBetween('now', '+30 days'),
            'status' => fake()->randomElement(['pending', 'overdue']),
        ]);
    }

    public function recurring(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_recurring' => true,
            'recurring_frequency' => fake()->randomElement(['daily', 'weekly', 'monthly', 'yearly']),
            'next_due_date' => fake()->dateTimeBetween('now', '+30 days'),
        ]);
    }
}
