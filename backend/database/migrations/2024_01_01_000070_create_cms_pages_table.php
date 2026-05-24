<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_pages', function (Blueprint $table) {
            $table->id();
            $table->string('identifier', 100)->unique()->comment('e.g. about-us, faq, flight-area, contact');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('identifier');
        });

        Schema::create('cms_page_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cms_page_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 10);
            $table->string('title');
            $table->string('slug');
            $table->longText('body');
            $table->string('meta_title', 255)->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->string('og_title', 255)->nullable();
            $table->string('og_description', 500)->nullable();
            $table->timestamps();

            $table->unique(['cms_page_id', 'locale']);
            $table->unique(['locale', 'slug']);
            $table->index(['locale', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_page_translations');
        Schema::dropIfExists('cms_pages');
    }
};
