<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnUpdate();
            $table->string('title');
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->string('category', 100)->nullable();
            $table->string('type', 100);
            $table->string('location');
            $table->unsignedBigInteger('salary_min')->nullable();
            $table->unsignedBigInteger('salary_max')->nullable();
            $table->date('deadline')->nullable();
            $table->string('status', 20)->default('open');
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['category', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_listings');
    }
};
