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
        Schema::create('project_invitations', function (Blueprint $table) {
            $table->id();

            // the project
            $table->foreignId('project_id')
            ->constrained()
            ->cascadeOnDelete();

            // the admin who made the invitation
            $table->foreignId('invited_by')
                ->constrained('users')
                ->restrictOnDelete();

            // the user that is sent the invitation
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->cascadeOnDelete();

            $table->enum('type', ['username', 'link']); // username or link
            $table->string('token_hash')->nullable()->unique();

            $table->enum('status', ['pending', 'confirmed', 'rejected'])->default('pending');

            $table->timestamp('expires_at')->nullable();
            $table->timestamp('accepted_at')->nullable();

            $table->timestamps();
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_invitations');
    }
};
