<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\AdminController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/reveal-key', [OrderController::class, 'revealKey']);

    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::get('/products/{id}/reviews', [ReviewController::class, 'productReviews']);

    Route::post('/support/tickets', [SupportController::class, 'createTicket']);
    Route::get('/support/tickets', [SupportController::class, 'myTickets']);
    Route::get('/support/faq', [SupportController::class, 'faq']);

    Route::middleware('admin')->group(function () {
        Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
        Route::post('/admin/products', [AdminController::class, 'createProduct']);
        Route::put('/admin/products/{product}', [AdminController::class, 'updateProduct']);
    });
});

Route::get('/support/faq', [SupportController::class, 'faq']);
