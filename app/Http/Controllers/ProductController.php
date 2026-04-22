<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        if ($request->has('platform')) {
            $query->where('platform', $request->get('platform'));
        }

        if ($request->has('genre')) {
            $query->where('genre', $request->get('genre'));
        }

        if ($request->has('sort')) {
            $sort = $request->get('sort');
            switch ($sort) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'rating':
                    $query->orderBy('rating', 'desc');
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
            }
        }

        return response()->json($query->paginate(12));
    }

    public function show($id)
    {
        $product = Product::with('reviews.user')->findOrFail($id);
        return response()->json($product);
    }

    public function featured()
    {
        return response()->json(
            Product::orderBy('rating', 'desc')->limit(8)->get()
        );
    }
}
