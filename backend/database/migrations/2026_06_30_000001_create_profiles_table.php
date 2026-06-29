<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->string('display_id')->nullable()->unique();

            $table->string('full_name');
            $table->enum('gender', ['male', 'female']);
            $table->date('date_of_birth');
            $table->enum('profile_for', ['self', 'son', 'daughter', 'brother', 'sister', 'relative', 'friend'])->default('self');

            // Community
            $table->string('religion')->nullable();
            $table->string('caste')->nullable();
            $table->string('mother_tongue')->nullable()->default('Malayalam');

            // Astrology
            $table->string('star')->nullable();   // Nakshatra
            $table->string('rasi')->nullable();

            // Lifestyle
            $table->enum('marital_status', ['never_married', 'divorced', 'widowed', 'separated'])->default('never_married');
            $table->unsignedSmallInteger('height_cm')->nullable();
            $table->enum('diet', ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan'])->nullable();

            // Education & career
            $table->string('education')->nullable();
            $table->string('occupation')->nullable();
            $table->unsignedInteger('annual_income')->nullable();

            // Location
            $table->string('country')->nullable()->default('India');
            $table->string('state')->nullable();
            $table->string('district')->nullable();
            $table->string('city')->nullable();

            // Free text & preference
            $table->text('about')->nullable();
            $table->enum('looking_for', ['male', 'female'])->nullable();
            $table->string('photo_url')->nullable();

            $table->boolean('is_verified')->default(false);
            $table->unsignedTinyInteger('completeness')->default(0);

            $table->timestamps();

            $table->index(['gender', 'religion']);
            $table->index('district');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
