<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Catch-all route for SPA - serves index.html for any non-API route
// This handles frontend routes like /login, /dashboard, /register etc.
Route::get('/{any}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }
    return response('Not Found', 404);
})->where('any', '^(?!api).*$');
