<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->orders()->with('products')->paginate(10)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'products' => 'required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string',
        ]);

        $order = Order::create([
            'user_id' => $request->user()->id,
            'total_price' => 0,
            'status' => 'pending',
            'payment_method' => $validated['payment_method'],
        ]);

        $totalPrice = 0;
        foreach ($validated['products'] as $product) {
            $prod = \App\Models\Product::findOrFail($product['id']);
            $price = $prod->price * $product['quantity'];
            $totalPrice += $price;

            $order->products()->attach($prod->id, [
                'quantity' => $product['quantity'],
                'price' => $prod->price,
                'game_key' => 'KEY-' . strtoupper(str_random(16)),
            ]);
        }

        $order->update(['total_price' => $totalPrice, 'status' => 'completed']);

        return response()->json($order->load('products'), 201);
    }

    public function show($id)
    {
        $order = Order::with('products')->findOrFail($id);
        $this->authorize('view', $order);
        return response()->json($order);
    }

    public function revealKey($id)
    {
        $order = Order::findOrFail($id);
        $this->authorize('view', $order);

        $order->update(['game_key_revealed' => true, 'delivery_date' => now()]);

        return response()->json($order->load('products'));
    }
}
