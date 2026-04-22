<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Index');
});

Route::get('/products', function () {
    return Inertia::render('ProductCatalog');
});

Route::get('/products/{id}', function ($id) {
    return Inertia::render('ProductDetails', ['productId' => $id]);
});

Route::get('/cart', function () {
    return Inertia::render('ShoppingCart');
});

Route::get('/checkout', function () {
    return Inertia::render('Checkout');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    });

    Route::get('/orders', function () {
        return Inertia::render('OrderHistory');
    });

    Route::get('/orders/{id}', function ($id) {
        return Inertia::render('OrderConfirmation', ['orderId' => $id]);
    });

    Route::get('/wishlist', function () {
        return Inertia::render('Wishlist');
    });

    Route::get('/support', function () {
        return Inertia::render('Support');
    });

    Route::get('/admin', function () {
        return Inertia::render('AdminDashboard');
    })->middleware('admin');
});

Route::get('/login', function () {
    return Inertia::render('Login');
})->name('login');

Route::get('/register', function () {
    return Inertia::render('Register');
})->name('register');
