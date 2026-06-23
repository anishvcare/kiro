<?php

namespace App\Services;

use App\Models\Question;
use App\Models\Subject;
use App\Models\Test;
use Illuminate\Support\Collection;

class TestGeneratorService
{
    /**
     * Generate a test with weighted question distribution across subjects
     */
    public function generateWeightedTest(
        string $type,
        int $questionCount = 30,
        int $durationMinutes = 30,
        ?string $title = null,
        ?\Carbon\Carbon $scheduledDate = null
    ): Test {
        $subjects = Subject::where('is_active', true)->get();
        $questionIds = $this->selectWeightedQuestions($subjects, $questionCount);

        $defaultTitle = match ($type) {
            'daily_morning' => 'Morning Challenge - ' . ($scheduledDate ?? today())->format('d M Y'),
            'daily_evening' => 'Evening Challenge - ' . ($scheduledDate ?? today())->format('d M Y'),
            'grand_mock' => 'FMGE Grand Mock Exam',
            default => 'Practice Test',
        };

        return Test::create([
            'title' => $title ?? $defaultTitle,
            'type' => $type,
            'question_count' => count($questionIds),
            'duration_minutes' => $durationMinutes,
            'scheduled_date' => $scheduledDate ?? today(),
            'scheduled_time' => $type === 'daily_morning' ? '09:00:00' : '19:00:00',
            'status' => 'active',
            'question_ids' => $questionIds,
        ]);
    }

    /**
     * Select questions with weighted distribution based on subject weights
     */
    private function selectWeightedQuestions(Collection $subjects, int $totalNeeded): array
    {
        $questionIds = [];
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

        // Shuffle and ensure exact count
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

        return $questionIds;
    }

    /**
     * Generate Grand Mock Exam (300 questions, balanced distribution)
     */
    public function generateGrandMock(): Test
    {
        return $this->generateWeightedTest(
            type: 'grand_mock',
            questionCount: 300,
            durationMinutes: 300,
            title: 'FMGE Grand Mock Exam - ' . now()->format('M Y')
        );
    }

    /**
     * Generate practice test for a specific subject/topic
     */
    public function generatePracticeTest(
        int $subjectId,
        ?int $topicId = null,
        int $questionCount = 30
    ): Test {
        $query = Question::where('subject_id', $subjectId)
            ->where('status', 'active');

        if ($topicId) {
            $query->where('topic_id', $topicId);
        }

        $questionIds = $query->inRandomOrder()
            ->limit($questionCount)
            ->pluck('id')
            ->toArray();

        $subject = Subject::find($subjectId);

        return Test::create([
            'title' => "Practice - {$subject->name}",
            'type' => 'practice',
            'subject_id' => $subjectId,
            'topic_id' => $topicId,
            'question_count' => count($questionIds),
            'duration_minutes' => count($questionIds), // 1 min per question
            'status' => 'active',
            'question_ids' => $questionIds,
        ]);
    }
}
