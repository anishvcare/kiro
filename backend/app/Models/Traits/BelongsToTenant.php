<?php

namespace App\Models\Traits;

use App\Models\Scopes\TenantScope;
use Illuminate\Support\Facades\Auth;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope());

        static::creating(function ($model) {
            if (Auth::check() && !$model->tenant_id) {
                $model->tenant_id = Auth::user()->tenant_id;
            }
        });
    }
}
