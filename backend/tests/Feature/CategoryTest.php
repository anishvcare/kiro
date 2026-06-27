<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['tenant_id' => 12345]);
    }

    public function test_user_can_list_categories(): void
    {
        Sanctum::actingAs($this->user);

        Category::withoutGlobalScopes()->create([
            'name' => 'Food',
            'type' => 'expense',
            'tenant_id' => $this->user->tenant_id,
            'sort_order' => 1,
        ]);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'categories' => [
                    '*' => ['id', 'name', 'type', 'color', 'icon', 'sort_order'],
                ],
            ]);
    }

    public function test_user_can_create_category(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/categories', [
            'name' => 'Groceries',
            'type' => 'expense',
            'color' => '#FF0000',
            'icon' => 'cart',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Category created successfully',
                'category' => [
                    'name' => 'Groceries',
                    'type' => 'expense',
                    'color' => '#FF0000',
                ],
            ]);

        $this->assertDatabaseHas('categories', [
            'name' => 'Groceries',
            'tenant_id' => $this->user->tenant_id,
        ]);
    }

    public function test_user_can_create_subcategory(): void
    {
        Sanctum::actingAs($this->user);

        $parent = Category::withoutGlobalScopes()->create([
            'name' => 'Food',
            'type' => 'expense',
            'tenant_id' => $this->user->tenant_id,
            'sort_order' => 1,
        ]);

        $response = $this->postJson('/api/categories', [
            'name' => 'Fast Food',
            'type' => 'expense',
            'parent_id' => $parent->id,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'category' => [
                    'name' => 'Fast Food',
                    'parent_id' => $parent->id,
                ],
            ]);
    }

    public function test_user_can_update_category(): void
    {
        Sanctum::actingAs($this->user);

        $category = Category::withoutGlobalScopes()->create([
            'name' => 'Food',
            'type' => 'expense',
            'tenant_id' => $this->user->tenant_id,
            'sort_order' => 1,
        ]);

        $response = $this->putJson("/api/categories/{$category->id}", [
            'name' => 'Food & Dining',
            'color' => '#00FF00',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Category updated successfully',
                'category' => [
                    'name' => 'Food & Dining',
                    'color' => '#00FF00',
                ],
            ]);
    }

    public function test_user_can_delete_category(): void
    {
        Sanctum::actingAs($this->user);

        $category = Category::withoutGlobalScopes()->create([
            'name' => 'Food',
            'type' => 'expense',
            'tenant_id' => $this->user->tenant_id,
            'sort_order' => 1,
        ]);

        $response = $this->deleteJson("/api/categories/{$category->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Category deleted successfully']);

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_user_cannot_see_other_tenant_categories(): void
    {
        Sanctum::actingAs($this->user);

        $otherUser = User::factory()->create(['tenant_id' => 99999]);

        Category::withoutGlobalScopes()->create([
            'name' => 'Other Tenant Category',
            'type' => 'expense',
            'tenant_id' => $otherUser->tenant_id,
            'sort_order' => 1,
        ]);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'categories');
    }

    public function test_user_can_filter_categories_by_type(): void
    {
        Sanctum::actingAs($this->user);

        Category::withoutGlobalScopes()->create([
            'name' => 'Salary',
            'type' => 'income',
            'tenant_id' => $this->user->tenant_id,
            'sort_order' => 1,
        ]);

        Category::withoutGlobalScopes()->create([
            'name' => 'Food',
            'type' => 'expense',
            'tenant_id' => $this->user->tenant_id,
            'sort_order' => 1,
        ]);

        $response = $this->getJson('/api/categories?type=income');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'categories');
    }

    public function test_category_creation_requires_valid_data(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/categories', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'type']);
    }
}
