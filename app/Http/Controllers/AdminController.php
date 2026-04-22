<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'total_users' => User::count(),
            'total_products' => Product::count(),
            'total_sales' => Order::where('status', 'completed')->count(),
            'revenue' => Order::where('status', 'completed')->sum('total_price'),
            'recent_orders' => Order::latest()->limit(5)->get(),
        ]);
    }

    public function createProduct(Request $request)
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0.01',
            'platform' => 'required|string',
            'genre' => 'required|string',
            'image_url' => 'required|url',
            'publisher' => 'required|string',
            'stock' => 'required|integer|min:0',
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    public function updateProduct(Request $request, Product $product)
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0.01',
            'platform' => 'sometimes|string',
            'genre' => 'sometimes|string',
            'image_url' => 'sometimes|url',
            'stock' => 'sometimes|integer|min:0',
        ]);

        $product->update($validated);
        return response()->json($product);
    }
}
