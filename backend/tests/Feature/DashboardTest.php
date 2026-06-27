<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['tenant_id' => 12345]);
    }

    public function test_user_can_access_dashboard(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'monthly_summary' => ['income', 'expense', 'balance'],
                'upcoming_bills',
                'overdue_bills',
                'recent_transactions',
                'category_breakdown',
            ]);
    }

    public function test_dashboard_shows_correct_monthly_totals(): void
    {
        Sanctum::actingAs($this->user);

        Transaction::withoutGlobalScopes()->create([
            'tenant_id' => $this->user->tenant_id,
            'user_id' => $this->user->id,
            'type' => 'income',
            'amount' => 5000.00,
            'date' => now()->format('Y-m-d'),
            'status' => 'paid',
        ]);

        Transaction::withoutGlobalScopes()->create([
            'tenant_id' => $this->user->tenant_id,
            'user_id' => $this->user->id,
            'type' => 'expense',
            'amount' => 1500.00,
            'date' => now()->format('Y-m-d'),
            'status' => 'paid',
        ]);

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(200);
        $this->assertEquals(5000, $response->json('monthly_summary.income'));
        $this->assertEquals(1500, $response->json('monthly_summary.expense'));
        $this->assertEquals(3500, $response->json('monthly_summary.balance'));
    }

    public function test_dashboard_shows_upcoming_bills(): void
    {
        Sanctum::actingAs($this->user);

        Transaction::withoutGlobalScopes()->create([
            'tenant_id' => $this->user->tenant_id,
            'user_id' => $this->user->id,
            'type' => 'expense',
            'amount' => 200.00,
            'description' => 'Electricity',
            'date' => now()->format('Y-m-d'),
            'is_bill' => true,
            'bill_due_date' => now()->addDays(5)->format('Y-m-d'),
            'status' => 'pending',
        ]);

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('upcoming_bills'));
    }

    public function test_dashboard_shows_overdue_bills(): void
    {
        Sanctum::actingAs($this->user);

        Transaction::withoutGlobalScopes()->create([
            'tenant_id' => $this->user->tenant_id,
            'user_id' => $this->user->id,
            'type' => 'expense',
            'amount' => 300.00,
            'description' => 'Overdue Bill',
            'date' => now()->subDays(10)->format('Y-m-d'),
            'is_bill' => true,
            'bill_due_date' => now()->subDays(5)->format('Y-m-d'),
            'status' => 'overdue',
        ]);

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('overdue_bills'));
    }

    public function test_dashboard_does_not_show_other_tenant_data(): void
    {
        Sanctum::actingAs($this->user);

        $otherUser = User::factory()->create(['tenant_id' => 99999]);

        Transaction::withoutGlobalScopes()->create([
            'tenant_id' => $otherUser->tenant_id,
            'user_id' => $otherUser->id,
            'type' => 'income',
            'amount' => 10000.00,
            'date' => now()->format('Y-m-d'),
            'status' => 'paid',
        ]);

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(200);
        $this->assertEquals(0, $response->json('monthly_summary.income'));
    }

    public function test_unauthenticated_user_cannot_access_dashboard(): void
    {
        $response = $this->getJson('/api/dashboard');
        $response->assertStatus(401);
    }
}
