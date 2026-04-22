<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'price',
        'platform',
        'genre',
        'rating',
        'image_url',
        'release_date',
        'publisher',
        'stock',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'rating' => 'float',
        'release_date' => 'date',
    ];

    public function orders()
    {
        return $this->belongsToMany(Order::class, 'order_products');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function wishedBy()
    {
        return $this->belongsToMany(User::class, 'wishlist');
    }
}
