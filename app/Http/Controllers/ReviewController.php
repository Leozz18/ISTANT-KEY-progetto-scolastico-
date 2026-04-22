<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        $review = Review::create([
            'user_id' => $request->user()->id,
            'product_id' => $validated['product_id'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'verified' => true,
        ]);

        return response()->json($review, 201);
    }

    public function productReviews($productId)
    {
        return response()->json(
            Review::where('product_id', $productId)
                  ->with('user')
                  ->latest()
                  ->paginate(10)
        );
    }
}
