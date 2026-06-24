<?php

namespace App\Console\Commands;

use App\Models\Question;
use App\Models\Subject;
use App\Models\Test;
use Illuminate\Console\Command;

class GenerateDailyTests extends Command
{
    protected $signature = 'tests:generate-daily';
    protected $description = 'Generate daily morning and evening challenge tests';

    public function handle(): void
    {
        $today = today();

        // Check if today's tests already exist
        $morningExists = Test::where('type', 'daily_morning')->where('scheduled_date', $today)->exists();
        $eveningExists = Test::where('type', 'daily_evening')->where('scheduled_date', $today)->exists();

        if (!$morningExists) {
            $this->generateTest('daily_morning', $today, '09:00:00', 'Morning Challenge');
            $this->info("Morning challenge generated for {$today->format('Y-m-d')}");
        }

        if (!$eveningExists) {
            $this->generateTest('daily_evening', $today, '19:00:00', 'Evening Challenge');
            $this->info("Evening challenge generated for {$today->format('Y-m-d')}");
        }

        if ($morningExists && $eveningExists) {
            $this->info("Daily tests already exist for today.");
        }
    }

    private function generateTest(string $type, $date, string $time, string $prefix): void
    {
        $subjects = Subject::where('is_active', true)->get();
        $questionIds = [];
        $totalNeeded = 30;

        // Weighted distribution
        $totalWeight = $subjects->sum('question_weight');

        foreach ($subjects as $subject) {
            $count = max(1, (int) round(($subject->question_weight / $totalWeight) * $totalNeeded));
            $ids = Question::where('subject_id', $subject->id)
                ->where('status', 'active')
                ->inRandomOrder()
                ->limit($count)
                ->pluck('id')
                ->toArray();
            $questionIds = array_merge($questionIds, $ids);
        }

        // Shuffle and trim to exactly 30
        shuffle($questionIds);
        $questionIds = array_slice(array_unique($questionIds), 0, $totalNeeded);

        // Fill remaining if needed
        if (count($questionIds) < $totalNeeded) {
            $more = Question::where('status', 'active')
                ->whereNotIn('id', $questionIds)
                ->inRandomOrder()
                ->limit($totalNeeded - count($questionIds))
                ->pluck('id')
                ->toArray();
            $questionIds = array_merge($questionIds, $more);
        }

        Test::create([
            'title' => "{$prefix} - " . $date->format('d M Y'),
            'type' => $type,
            'question_count' => 30,
            'duration_minutes' => 30,
            'scheduled_date' => $date,
            'scheduled_time' => $time,
            'status' => 'active',
            'question_ids' => $questionIds,
        ]);
    }
}
