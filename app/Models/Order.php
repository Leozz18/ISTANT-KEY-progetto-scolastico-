<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'total_price',
        'status',
        'payment_method',
        'delivery_date',
        'game_key_revealed',
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
        'game_key_revealed' => 'boolean',
        'delivery_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'order_products')
                    ->withPivot('game_key', 'quantity', 'price');
    }
}
