<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class DefaultCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = 1;

        $expenseCategories = [
            ['name' => 'Food & Dining', 'color' => '#FF6384', 'icon' => 'utensils', 'sort_order' => 1],
            ['name' => 'Transport', 'color' => '#36A2EB', 'icon' => 'car', 'sort_order' => 2],
            ['name' => 'Housing', 'color' => '#FFCE56', 'icon' => 'home', 'sort_order' => 3],
            ['name' => 'Utilities', 'color' => '#4BC0C0', 'icon' => 'bolt', 'sort_order' => 4],
            ['name' => 'Entertainment', 'color' => '#9966FF', 'icon' => 'film', 'sort_order' => 5],
            ['name' => 'Shopping', 'color' => '#FF9F40', 'icon' => 'shopping-bag', 'sort_order' => 6],
            ['name' => 'Healthcare', 'color' => '#FF6384', 'icon' => 'heart', 'sort_order' => 7],
            ['name' => 'Education', 'color' => '#C9CBCF', 'icon' => 'book', 'sort_order' => 8],
            ['name' => 'Personal Care', 'color' => '#FF99CC', 'icon' => 'user', 'sort_order' => 9],
            ['name' => 'Other Expense', 'color' => '#808080', 'icon' => 'ellipsis', 'sort_order' => 10],
        ];

        $incomeCategories = [
            ['name' => 'Salary', 'color' => '#4CAF50', 'icon' => 'briefcase', 'sort_order' => 1],
            ['name' => 'Freelance', 'color' => '#8BC34A', 'icon' => 'laptop', 'sort_order' => 2],
            ['name' => 'Investment', 'color' => '#CDDC39', 'icon' => 'chart-line', 'sort_order' => 3],
            ['name' => 'Business', 'color' => '#009688', 'icon' => 'store', 'sort_order' => 4],
            ['name' => 'Other Income', 'color' => '#607D8B', 'icon' => 'plus-circle', 'sort_order' => 5],
        ];

        foreach ($expenseCategories as $category) {
            Category::withoutGlobalScopes()->create(array_merge($category, [
                'type' => 'expense',
                'tenant_id' => $tenantId,
            ]));
        }

        foreach ($incomeCategories as $category) {
            Category::withoutGlobalScopes()->create(array_merge($category, [
                'type' => 'income',
                'tenant_id' => $tenantId,
            ]));
        }
    }
}
