<?php

namespace App\Domains\Blog\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlogPostTranslation extends Model
{
    protected $table = 'blog_post_translations';

    protected $fillable = [
        'blog_post_id',
        'locale',
        'title',
        'slug',
        'excerpt',
        'body',
        'meta_title',
        'meta_description',
        'og_title',
        'og_description',
    ];

    public function blogPost(): BelongsTo
    {
        return $this->belongsTo(BlogPost::class);
    }
}
