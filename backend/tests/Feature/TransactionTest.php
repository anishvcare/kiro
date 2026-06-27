<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['tenant_id' => 12345]);
        $this->category = Category::withoutGlobalScopes()->create([
            'name' => 'Food',
            'type' => 'expense',
            'tenant_id' => $this->user->tenant_id,
            'sort_order' => 1,
        ]);
    }

    public function test_user_can_list_transactions(): void
    {
        Sanctum::actingAs($this->user);

        Transaction::withoutGlobalScopes()->create([
            'tenant_id' => $this->user->tenant_id,
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
            'type' => 'expense',
            'amount' => 50.00,
            'description' => 'Lunch',
            'date' => now()->format('Y-m-d'),
            'status' => 'paid',
        ]);

        $response = $this->getJson('/api/transactions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'transactions' => [
                    '*' => ['id', 'type', 'amount', 'description', 'date', 'status'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_user_can_create_transaction(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/transactions', [
            'category_id' => $this->category->id,
            'type' => 'expense',
            'amount' => 25.50,
            'description' => 'Coffee',
            'date' => '2024-01-15',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Transaction created successfully',
                'transaction' => [
                    'type' => 'expense',
                    'amount' => '25.50',
                    'description' => 'Coffee',
                ],
            ]);

        $this->assertDatabaseHas('transactions', [
            'description' => 'Coffee',
            'tenant_id' => $this->user->tenant_id,
            'user_id' => $this->user->id,
        ]);
    }

    public function test_user_can_create_bill_transaction(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/transactions', [
            'category_id' => $this->category->id,
            'type' => 'expense',
            'amount' => 100.00,
            'description' => 'Electricity Bill',
            'date' => '2024-01-15',
            'is_bill' => true,
            'bill_due_date' => '2024-02-01',
            'status' => 'pending',
            'priority_color' => '#FF0000',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'transaction' => [
                    'is_bill' => true,
                    'status' => 'pending',
                    'priority_color' => '#FF0000',
                ],
            ]);
    }

    public function test_user_can_create_recurring_transaction(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/transactions', [
            'type' => 'expense',
            'amount' => 200.00,
            'description' => 'Monthly Rent',
            'date' => '2024-01-01',
            'is_recurring' => true,
            'recurring_frequency' => 'monthly',
            'next_due_date' => '2024-02-01',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'transaction' => [
                    'is_recurring' => true,
                    'recurring_frequency' => 'monthly',
                ],
            ]);
    }

    public function test_user_can_update_transaction(): void
    {
        Sanctum::actingAs($this->user);

        $transaction = Transaction::withoutGlobalScopes()->create([
            'tenant_id' => $this->user->tenant_id,
            'user_id' => $this->user->id,
            'type' => 'expense',
            'amount' => 50.00,
            'description' => 'Lunch',
            'date' => now()->format('Y-m-d'),
            'status' => 'paid',
        ]);

        $response = $this->putJson("/api/transactions/{$transaction->id}", [
            'amount' => 75.00,
            'description' => 'Dinner',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Transaction updated successfully',
                'transaction' => [
                    'amount' => '75.00',
                    'description' => 'Dinner',
                ],
            ]);
    }

    public function test_user_can_delete_transaction(): void
    {
        Sanctum::actingAs($this->user);

        $transaction = Transaction::withoutGlobalScopes()->create([
            'tenant_id' => $this->user->tenant_id,
            'user_id' => $this->user->id,
            'type' => 'expense',
            'amount' => 50.00,
            'description' => 'Lunch',
            'date' => now()->format('Y-m-d'),
            'status' => 'paid',
        ]);

        $response = $this->deleteJson("/api/transactions/{$transaction->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Transaction deleted successfully']);

        $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);
    }

    public function test_user_cannot_see_other_tenant_transactions(): void
    {
        Sanctum::actingAs($this->user);

        $otherUser = User::factory()->create(['tenant_id' => 99999]);

        Transaction::withoutGlobalScopes()->create([
            'tenant_id' => $otherUser->tenant_id,
            'user_id' => $otherUser->id,
            'type' => 'expense',
            'amount' => 50.00,
            'description' => 'Other Tenant',
            'date' => now()->format('Y-m-d'),
            'status' => 'paid',
        ]);

        $response = $this->getJson('/api/transactions');

        $response->assertStatus(200);
        $this->assertEquals(0, $response->json('meta.total'));
    }

    public function test_user_can_filter_transactions_by_type(): void
    {
        Sanctum::actingAs($this->user);

        Transaction::withoutGlobalScopes()->create([
            'tenant_id' => $this->user->tenant_id,
            'user_id' => $this->user->id,
            'type' => 'income',
            'amount' => 1000.00,
            'description' => 'Salary',
            'date' => now()->format('Y-m-d'),
            'status' => 'paid',
        ]);

        Transaction::withoutGlobalScopes()->create([
            'tenant_id' => $this->user->tenant_id,
            'user_id' => $this->user->id,
            'type' => 'expense',
            'amount' => 50.00,
            'description' => 'Food',
            'date' => now()->format('Y-m-d'),
            'status' => 'paid',
        ]);

        $response = $this->getJson('/api/transactions?type=income');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('meta.total'));
    }

    public function test_transaction_creation_requires_valid_data(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/transactions', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type', 'amount', 'date']);
    }
}
