<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run()
    {
        $products = [
            [
                'title' => 'The Witcher 3: Wild Hunt',
                'slug' => 'witcher-3-wild-hunt',
                'description' => 'The Witcher 3 is an action role-playing game with a dark fantasy setting.',
                'price' => 29.99,
                'platform' => 'PC',
                'genre' => 'RPG',
                'rating' => 4.8,
                'image_url' => 'https://via.placeholder.com/300x400?text=Witcher3',
                'release_date' => '2015-05-19',
                'publisher' => 'CD Projekt Red',
                'stock' => 100,
            ],
            [
                'title' => 'Cyberpunk 2077',
                'slug' => 'cyberpunk-2077',
                'description' => 'An open-world, action-adventure story set in Night City.',
                'price' => 39.99,
                'platform' => 'PC',
                'genre' => 'Action',
                'rating' => 4.2,
                'image_url' => 'https://via.placeholder.com/300x400?text=Cyberpunk2077',
                'release_date' => '2020-12-10',
                'publisher' => 'CD Projekt Red',
                'stock' => 150,
            ],
            [
                'title' => 'Elden Ring',
                'slug' => 'elden-ring',
                'description' => 'A collaboration between FromSoftware and George R. R. Martin.',
                'price' => 59.99,
                'platform' => 'PC',
                'genre' => 'Action',
                'rating' => 4.9,
                'image_url' => 'https://via.placeholder.com/300x400?text=EldenRing',
                'release_date' => '2022-02-25',
                'publisher' => 'FromSoftware',
                'stock' => 200,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
