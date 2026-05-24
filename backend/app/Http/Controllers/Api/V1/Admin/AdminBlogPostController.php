<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Blog\Models\BlogPost;
use App\Domains\Blog\Models\BlogPostTranslation;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminBlogPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 30), 100);

        $translations = BlogPostTranslation::with('blogPost')
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'data' => collect($translations->items())->map(fn ($t) => $this->format($t)),
            'meta' => [
                'current_page' => $translations->currentPage(),
                'last_page' => $translations->lastPage(),
                'per_page' => $translations->perPage(),
                'total' => $translations->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $translation = BlogPostTranslation::with('blogPost')->findOrFail($id);

        return response()->json(['data' => $this->format($translation)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'excerpt' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'string', 'max:500'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'is_published' => ['boolean'],
            'locale' => ['required', 'string', 'in:es,ca,fr,en'],
        ]);

        $post = BlogPost::create([
            'author_id' => $request->user()->id,
            'featured_image' => $data['cover_image'] ?? null,
            'status' => ($data['is_published'] ?? false) ? 'published' : 'draft',
            'published_at' => ($data['is_published'] ?? false) ? now() : null,
        ]);

        $slug = $this->uniqueSlug($data['title'], $data['locale']);

        $translation = $post->translations()->create([
            'locale' => $data['locale'],
            'title' => $data['title'],
            'slug' => $slug,
            'body' => $data['content'],
            'excerpt' => $data['excerpt'] ?? null,
            'meta_title' => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
        ]);

        $translation->load('blogPost');

        return response()->json(['data' => $this->format($translation)], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $translation = BlogPostTranslation::with('blogPost')->findOrFail($id);
        $post = $translation->blogPost;

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string'],
            'excerpt' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'string', 'max:500'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'is_published' => ['boolean'],
        ]);

        $postUpdates = [];
        if (array_key_exists('cover_image', $data)) $postUpdates['featured_image'] = $data['cover_image'];
        if (isset($data['is_published'])) {
            $postUpdates['status'] = $data['is_published'] ? 'published' : 'draft';
            if ($data['is_published'] && ! $post->published_at) {
                $postUpdates['published_at'] = now();
            }
        }
        if ($postUpdates) $post->update($postUpdates);

        $translationUpdates = [];
        if (isset($data['title'])) $translationUpdates['title'] = $data['title'];
        if (isset($data['content'])) $translationUpdates['body'] = $data['content'];
        if (array_key_exists('excerpt', $data)) $translationUpdates['excerpt'] = $data['excerpt'];
        if (array_key_exists('meta_title', $data)) $translationUpdates['meta_title'] = $data['meta_title'];
        if (array_key_exists('meta_description', $data)) $translationUpdates['meta_description'] = $data['meta_description'];
        if ($translationUpdates) $translation->update($translationUpdates);

        $translation->refresh()->load('blogPost');

        return response()->json(['data' => $this->format($translation)]);
    }

    public function destroy(int $id): JsonResponse
    {
        $translation = BlogPostTranslation::with('blogPost')->findOrFail($id);
        $translation->blogPost->delete();

        return response()->json(['message' => 'Blog post deleted.']);
    }

    private function format(BlogPostTranslation $t): array
    {
        $post = $t->blogPost;

        return [
            'id' => $t->id,
            'slug' => $t->slug,
            'title' => $t->title,
            'content' => $t->body,
            'excerpt' => $t->excerpt,
            'cover_image' => $post?->featured_image,
            'meta_title' => $t->meta_title,
            'meta_description' => $t->meta_description,
            'is_published' => $post?->status === 'published',
            'published_at' => $post?->published_at?->toISOString(),
            'reading_time_minutes' => $this->estimateReadingTime($t->body),
            'locale' => $t->locale,
            'created_at' => $t->created_at?->toISOString(),
            'updated_at' => $t->updated_at?->toISOString(),
        ];
    }

    private function uniqueSlug(string $title, string $locale): string
    {
        $base = Str::slug($title) . '-' . $locale;
        $slug = $base;
        $i = 1;
        while (BlogPostTranslation::where('locale', $locale)->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    private function estimateReadingTime(string $body): int
    {
        $wordCount = str_word_count(strip_tags($body));

        return max(1, (int) round($wordCount / 200));
    }
}
