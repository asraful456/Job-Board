<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['company_admin', 'screener', 'hr', 'candidate'])
                  ->default('candidate')
                  ->after('password');

            $table->foreignId('company_id')
                  ->nullable()
                  ->after('role')
                  ->constrained('companies')
                  ->nullOnDelete();

            $table->string('phone')->nullable()->after('company_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropColumn(['role', 'company_id', 'phone']);
        });
    }
};