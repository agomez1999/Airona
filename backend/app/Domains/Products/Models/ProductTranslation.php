<?php

namespace App\Domains\Products\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductTranslation extends Model
{
    protected $fillable = [
        'product_id',
        'locale',
        'name',
        'slug',
        'description',
        'short_description',
        'meta_title',
        'meta_description',
        'og_title',
        'og_description',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
