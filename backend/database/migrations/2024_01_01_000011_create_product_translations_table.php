<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 10);
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('short_description', 500)->nullable();
            $table->string('meta_title', 255)->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->string('og_title', 255)->nullable();
            $table->string('og_description', 500)->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'locale']);
            $table->index('locale');
            $table->index(['locale', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_translations');
    }
};
