<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function createTicket(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'priority' => 'required|in:low,medium,high',
        ]);

        $ticket = SupportTicket::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'status' => 'open',
        ]);

        return response()->json($ticket, 201);
    }

    public function myTickets(Request $request)
    {
        return response()->json(
            $request->user()->tickets()->latest()->paginate(10)
        );
    }

    public function faq()
    {
        return response()->json([
            [
                'id' => 1,
                'question' => 'How long does delivery take?',
                'answer' => 'Game keys are delivered instantly after purchase confirmation.',
            ],
            [
                'id' => 2,
                'question' => 'Can I get a refund?',
                'answer' => 'Refunds are available within 30 days of purchase if unused.',
            ],
        ]);
    }
}
