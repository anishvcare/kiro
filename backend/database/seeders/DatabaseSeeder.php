<?php

namespace Database\Seeders;

use App\Models\Badge;
use App\Models\Question;
use App\Models\Subject;
use App\Models\SubscriptionPlan;
use App\Models\Topic;
use App\Models\User;
use App\Models\UserStreak;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@fmgetrainer.com',
            'password' => Hash::make('admin123456'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
        UserStreak::create(['user_id' => $admin->id]);

        // Create Demo Student
        $student = User::create([
            'name' => 'Demo Student',
            'email' => 'student@fmgetrainer.com',
            'password' => Hash::make('student123456'),
            'role' => 'student',
            'university' => 'KMC Manipal',
            'country' => 'India',
            'streak_count' => 7,
            'total_tests_completed' => 24,
            'average_score' => 72,
            'email_verified_at' => now(),
        ]);
        UserStreak::create(['user_id' => $student->id, 'current_streak' => 7, 'longest_streak' => 15]);

        // Create Subscription Plans
        SubscriptionPlan::create([
            'name' => 'Free',
            'slug' => 'free',
            'description' => 'Basic FMGE preparation with daily tests',
            'price' => 0,
            'currency' => 'INR',
            'duration_days' => 365,
            'features' => ['Daily Tests', 'Basic Analytics', 'Leaderboard', '30-Day Challenge'],
            'sort_order' => 1,
        ]);

        SubscriptionPlan::create([
            'name' => 'Premium',
            'slug' => 'premium',
            'description' => 'Complete FMGE preparation with all features',
            'price' => 999,
            'currency' => 'INR',
            'duration_days' => 30,
            'features' => [
                'All Free Features',
                'Unlimited Practice',
                'Advanced Analytics',
                'Grand Mock Exams',
                'AI Recommendations',
                'Priority Support',
                'Ad-Free Experience',
            ],
            'sort_order' => 2,
        ]);

        SubscriptionPlan::create([
            'name' => 'Premium Yearly',
            'slug' => 'premium-yearly',
            'description' => 'Best value - Complete access for 1 year',
            'price' => 4999,
            'currency' => 'INR',
            'duration_days' => 365,
            'features' => [
                'All Premium Features',
                '12 Months Access',
                'Save 58%',
                'Priority New Features',
            ],
            'sort_order' => 3,
        ]);

        // Create Badges
        $badges = [
            ['name' => '7-Day Streak', 'slug' => 'streak-7', 'description' => 'Maintain a 7-day streak', 'criteria_type' => 'streak', 'criteria_value' => 7],
            ['name' => '15-Day Streak', 'slug' => 'streak-15', 'description' => 'Maintain a 15-day streak', 'criteria_type' => 'streak', 'criteria_value' => 15],
            ['name' => '30-Day Streak', 'slug' => 'streak-30', 'description' => 'Maintain a 30-day streak', 'criteria_type' => 'streak', 'criteria_value' => 30],
            ['name' => 'First 80%', 'slug' => 'first-80', 'description' => 'Score above 80% in a test', 'criteria_type' => 'score', 'criteria_value' => 80],
            ['name' => 'Perfect Score', 'slug' => 'perfect-score', 'description' => 'Score 100% in a test', 'criteria_type' => 'score', 'criteria_value' => 100],
            ['name' => '50 Tests', 'slug' => 'tests-50', 'description' => 'Complete 50 tests', 'criteria_type' => 'tests', 'criteria_value' => 50],
            ['name' => 'Top 10', 'slug' => 'top-10', 'description' => 'Reach top 10 on leaderboard', 'criteria_type' => 'rank', 'criteria_value' => 10],
            ['name' => 'Challenge Champion', 'slug' => 'challenge-champion', 'description' => 'Complete the 30-day challenge', 'criteria_type' => 'challenge', 'criteria_value' => 1],
        ];

        foreach ($badges as $badge) {
            Badge::create($badge);
        }

        // Create Subjects with Topics
        $this->seedSubjectsAndTopics();

        // Create Sample Questions
        $this->seedSampleQuestions();
    }

    private function seedSubjectsAndTopics(): void
    {
        $subjects = [
            ['name' => 'Anatomy', 'icon' => '🦴', 'color' => '#EF4444', 'weight' => 8, 'topics' => ['General Anatomy', 'Upper Limb', 'Lower Limb', 'Thorax', 'Abdomen', 'Head & Neck', 'Neuroanatomy', 'Embryology', 'Histology']],
            ['name' => 'Physiology', 'icon' => '💓', 'color' => '#EC4899', 'weight' => 8, 'topics' => ['General Physiology', 'Blood', 'CVS', 'Respiratory', 'Renal', 'GIT', 'Endocrine', 'CNS', 'Reproductive']],
            ['name' => 'Biochemistry', 'icon' => '🧬', 'color' => '#8B5CF6', 'weight' => 7, 'topics' => ['Enzymes', 'Carbohydrate Metabolism', 'Lipid Metabolism', 'Protein Metabolism', 'Nucleotide Metabolism', 'Molecular Biology', 'Vitamins', 'Minerals', 'Clinical Biochemistry']],
            ['name' => 'Pathology', 'icon' => '🔬', 'color' => '#3B82F6', 'weight' => 12, 'topics' => ['General Pathology', 'Hematology', 'Systemic Pathology', 'Immunopathology', 'Neoplasia', 'Genetic Disorders', 'Inflammation', 'Hemodynamic Disorders']],
            ['name' => 'Pharmacology', 'icon' => '💊', 'color' => '#10B981', 'weight' => 12, 'topics' => ['General Pharmacology', 'ANS', 'CVS Drugs', 'CNS Drugs', 'Chemotherapy', 'Autacoids', 'Endocrine Drugs', 'GIT Drugs', 'Respiratory Drugs']],
            ['name' => 'Microbiology', 'icon' => '🦠', 'color' => '#14B8A6', 'weight' => 9, 'topics' => ['General Microbiology', 'Bacteriology', 'Virology', 'Mycology', 'Parasitology', 'Immunology', 'Applied Microbiology']],
            ['name' => 'Forensic Medicine', 'icon' => '⚖️', 'color' => '#6B7280', 'weight' => 5, 'topics' => ['Forensic Pathology', 'Toxicology', 'Medical Jurisprudence', 'Clinical Forensic Medicine', 'Forensic Psychiatry']],
            ['name' => 'Community Medicine', 'icon' => '🏥', 'color' => '#06B6D4', 'weight' => 10, 'topics' => ['Epidemiology', 'Biostatistics', 'Nutrition', 'Maternal & Child Health', 'National Health Programs', 'Environmental Health', 'Communicable Diseases', 'Non-communicable Diseases']],
            ['name' => 'ENT', 'icon' => '👂', 'color' => '#F59E0B', 'weight' => 5, 'topics' => ['Ear', 'Nose & Paranasal Sinuses', 'Throat & Larynx', 'Head & Neck Tumors', 'Audiology']],
            ['name' => 'Ophthalmology', 'icon' => '👁️', 'color' => '#6366F1', 'weight' => 6, 'topics' => ['Anatomy of Eye', 'Cornea & Sclera', 'Lens & Cataract', 'Glaucoma', 'Retina', 'Orbit & Adnexa', 'Squint', 'Optics & Refraction']],
            ['name' => 'Medicine', 'icon' => '🩺', 'color' => '#059669', 'weight' => 15, 'topics' => ['Cardiology', 'Neurology', 'Respiratory', 'Gastroenterology', 'Endocrinology', 'Nephrology', 'Hematology', 'Rheumatology', 'Infectious Diseases', 'Dermatology']],
            ['name' => 'Surgery', 'icon' => '🔪', 'color' => '#EA580C', 'weight' => 12, 'topics' => ['General Surgery', 'GI Surgery', 'Hepatobiliary', 'Vascular Surgery', 'Urology', 'Endocrine Surgery', 'Breast', 'Surgical Oncology', 'Trauma']],
            ['name' => 'Orthopedics', 'icon' => '🦿', 'color' => '#84CC16', 'weight' => 6, 'topics' => ['General Orthopedics', 'Fractures', 'Joint Disorders', 'Spine', 'Bone Tumors', 'Pediatric Orthopedics', 'Sports Medicine']],
            ['name' => 'Pediatrics', 'icon' => '👶', 'color' => '#0EA5E9', 'weight' => 8, 'topics' => ['Neonatology', 'Growth & Development', 'Nutrition', 'Infectious Diseases', 'Cardiology', 'Nephrology', 'Neurology', 'Genetics']],
            ['name' => 'Obstetrics & Gynecology', 'icon' => '🤰', 'color' => '#F43F5E', 'weight' => 10, 'topics' => ['Normal Pregnancy', 'High Risk Pregnancy', 'Labor', 'Puerperium', 'Gynecological Disorders', 'Infertility', 'Contraception', 'Gynec Oncology']],
            ['name' => 'Dermatology', 'icon' => '🧴', 'color' => '#EAB308', 'weight' => 4, 'topics' => ['Infections', 'Papulosquamous', 'Vesiculobullous', 'Connective Tissue', 'Pigmentary', 'Hair & Nail', 'STDs']],
            ['name' => 'Psychiatry', 'icon' => '🧠', 'color' => '#7C3AED', 'weight' => 5, 'topics' => ['Psychotic Disorders', 'Mood Disorders', 'Anxiety Disorders', 'Substance Abuse', 'Personality Disorders', 'Child Psychiatry', 'Psychopharmacology']],
            ['name' => 'Radiology', 'icon' => '📡', 'color' => '#475569', 'weight' => 4, 'topics' => ['X-ray', 'CT Scan', 'MRI', 'Ultrasound', 'Nuclear Medicine', 'Interventional Radiology']],
            ['name' => 'Anesthesia', 'icon' => '😷', 'color' => '#78716C', 'weight' => 4, 'topics' => ['General Anesthesia', 'Regional Anesthesia', 'Pain Management', 'Critical Care', 'Resuscitation', 'Monitoring']],
        ];

        foreach ($subjects as $index => $subjectData) {
            $subject = Subject::create([
                'name' => $subjectData['name'],
                'slug' => Str::slug($subjectData['name']),
                'icon' => $subjectData['icon'],
                'color' => $subjectData['color'],
                'question_weight' => $subjectData['weight'],
                'sort_order' => $index + 1,
                'is_active' => true,
            ]);

            foreach ($subjectData['topics'] as $topicIndex => $topicName) {
                Topic::create([
                    'subject_id' => $subject->id,
                    'name' => $topicName,
                    'slug' => Str::slug($topicName),
                    'sort_order' => $topicIndex + 1,
                    'is_active' => true,
                ]);
            }
        }
    }

    private function seedSampleQuestions(): void
    {
        $questions = [
            // Medicine - Cardiology
            [
                'subject' => 'Medicine', 'topic' => 'Cardiology',
                'question_text' => 'A 45-year-old male presents with sudden onset severe chest pain radiating to the back. BP is 180/100 in right arm and 140/80 in left arm. What is the most likely diagnosis?',
                'options' => [['key' => 'A', 'text' => 'Aortic Dissection'], ['key' => 'B', 'text' => 'Myocardial Infarction'], ['key' => 'C', 'text' => 'Pulmonary Embolism'], ['key' => 'D', 'text' => 'Pneumothorax']],
                'correct_option' => 'A',
                'explanation' => 'The key finding is BP difference between arms (>20mmHg) with tearing chest pain radiating to back, classic for aortic dissection (Stanford Type A). MI typically has crushing substernal pain, PE has pleuritic pain with tachycardia.',
                'difficulty' => 'hard', 'type' => 'clinical_scenario',
            ],
            [
                'subject' => 'Medicine', 'topic' => 'Cardiology',
                'question_text' => 'Which of the following ECG findings is pathognomonic of hyperkalemia?',
                'options' => [['key' => 'A', 'text' => 'Tall peaked T waves'], ['key' => 'B', 'text' => 'ST elevation'], ['key' => 'C', 'text' => 'Q waves'], ['key' => 'D', 'text' => 'Delta waves']],
                'correct_option' => 'A',
                'explanation' => 'Hyperkalemia causes tall peaked T waves (earliest sign), followed by widened QRS, loss of P waves, and eventually sine wave pattern. ST elevation suggests MI, Q waves suggest old infarct, Delta waves indicate WPW syndrome.',
                'difficulty' => 'medium', 'type' => 'mcq',
            ],
            // Pharmacology
            [
                'subject' => 'Pharmacology', 'topic' => 'ANS',
                'question_text' => 'Atropine causes all of the following EXCEPT:',
                'options' => [['key' => 'A', 'text' => 'Mydriasis'], ['key' => 'B', 'text' => 'Tachycardia'], ['key' => 'C', 'text' => 'Miosis'], ['key' => 'D', 'text' => 'Dryness of mouth']],
                'correct_option' => 'C',
                'explanation' => 'Atropine is a muscarinic antagonist that causes mydriasis (pupil dilation), tachycardia, dry mouth, urinary retention, and decreased GI motility. Miosis (pupil constriction) is the opposite effect and would be caused by cholinergic agonists like pilocarpine.',
                'difficulty' => 'easy', 'type' => 'mcq',
            ],
            [
                'subject' => 'Pharmacology', 'topic' => 'Chemotherapy',
                'question_text' => 'Which anticancer drug causes hemorrhagic cystitis?',
                'options' => [['key' => 'A', 'text' => 'Cyclophosphamide'], ['key' => 'B', 'text' => 'Methotrexate'], ['key' => 'C', 'text' => 'Cisplatin'], ['key' => 'D', 'text' => 'Doxorubicin']],
                'correct_option' => 'A',
                'explanation' => 'Cyclophosphamide causes hemorrhagic cystitis due to its metabolite acrolein. Prevention is done with adequate hydration and MESNA (2-mercaptoethane sulfonate). Methotrexate causes mucositis, Cisplatin causes nephrotoxicity, Doxorubicin causes cardiotoxicity.',
                'difficulty' => 'medium', 'type' => 'mcq',
            ],
            // Pathology
            [
                'subject' => 'Pathology', 'topic' => 'Hematology',
                'question_text' => 'Which of the following is NOT a feature of Nephrotic Syndrome?',
                'options' => [['key' => 'A', 'text' => 'Proteinuria > 3.5g/day'], ['key' => 'B', 'text' => 'Hypoalbuminemia'], ['key' => 'C', 'text' => 'Hematuria'], ['key' => 'D', 'text' => 'Hyperlipidemia']],
                'correct_option' => 'C',
                'explanation' => 'Nephrotic syndrome is characterized by massive proteinuria (>3.5g/day), hypoalbuminemia, edema, and hyperlipidemia. Hematuria is a feature of Nephritic syndrome, not nephrotic. Remember: Nephrotic = protein loss; Nephritic = blood + protein.',
                'difficulty' => 'medium', 'type' => 'mcq',
            ],
            // Anatomy
            [
                'subject' => 'Anatomy', 'topic' => 'General Anatomy',
                'question_text' => 'The nerve passing through the carpal tunnel is:',
                'options' => [['key' => 'A', 'text' => 'Median nerve'], ['key' => 'B', 'text' => 'Ulnar nerve'], ['key' => 'C', 'text' => 'Radial nerve'], ['key' => 'D', 'text' => 'Musculocutaneous nerve']],
                'correct_option' => 'A',
                'explanation' => 'The median nerve passes through the carpal tunnel along with the flexor tendons. Compression here causes Carpal Tunnel Syndrome. The ulnar nerve passes through Guyon\'s canal. The radial nerve wraps around the humerus.',
                'difficulty' => 'easy', 'type' => 'mcq',
            ],
            // Microbiology
            [
                'subject' => 'Microbiology', 'topic' => 'Bacteriology',
                'question_text' => 'Acid-fast staining is used for diagnosis of:',
                'options' => [['key' => 'A', 'text' => 'Tuberculosis'], ['key' => 'B', 'text' => 'Typhoid'], ['key' => 'C', 'text' => 'Cholera'], ['key' => 'D', 'text' => 'Diphtheria']],
                'correct_option' => 'A',
                'explanation' => 'Acid-fast (Ziehl-Neelsen) staining is used for Mycobacterium tuberculosis due to its high mycolic acid content in the cell wall. The bacteria appear as red rods against a blue background. Typhoid is diagnosed by Widal test, Cholera by stool culture.',
                'difficulty' => 'easy', 'type' => 'mcq',
            ],
            // Surgery
            [
                'subject' => 'Surgery', 'topic' => 'General Surgery',
                'question_text' => 'Most common site of peptic ulcer is:',
                'options' => [['key' => 'A', 'text' => 'First part of duodenum'], ['key' => 'B', 'text' => 'Body of stomach'], ['key' => 'C', 'text' => 'Pyloric antrum'], ['key' => 'D', 'text' => 'Esophagus']],
                'correct_option' => 'A',
                'explanation' => 'The first part of the duodenum (duodenal bulb) is the most common site for peptic ulcers. Duodenal ulcers are 4x more common than gastric ulcers. They occur on the anterior wall and can perforate into the peritoneal cavity.',
                'difficulty' => 'easy', 'type' => 'mcq',
            ],
            // Pediatrics
            [
                'subject' => 'Pediatrics', 'topic' => 'Neonatology',
                'question_text' => 'Physiological jaundice in neonates appears on which day of life?',
                'options' => [['key' => 'A', 'text' => 'Day 2-3'], ['key' => 'B', 'text' => 'Within 24 hours'], ['key' => 'C', 'text' => 'Day 7-10'], ['key' => 'D', 'text' => 'Day 14']],
                'correct_option' => 'A',
                'explanation' => 'Physiological jaundice appears on day 2-3 of life, peaks on day 3-5, and resolves by day 7-10 in term infants. Jaundice appearing within 24 hours is always pathological (hemolytic disease). Late jaundice (>2 weeks) suggests breast milk jaundice or biliary atresia.',
                'difficulty' => 'easy', 'type' => 'mcq',
            ],
            // OBG
            [
                'subject' => 'Obstetrics & Gynecology', 'topic' => 'Normal Pregnancy',
                'question_text' => 'The most reliable sign of ovulation is:',
                'options' => [['key' => 'A', 'text' => 'Rise in basal body temperature'], ['key' => 'B', 'text' => 'Mittelschmerz'], ['key' => 'C', 'text' => 'Cervical mucus changes'], ['key' => 'D', 'text' => 'Secretory endometrium on biopsy']],
                'correct_option' => 'D',
                'explanation' => 'Secretory endometrium on biopsy is the most reliable sign of ovulation as it proves progesterone action (which only occurs after ovulation). BBT rise is presumptive. Mittelschmerz is mid-cycle pain. Cervical mucus changes are suggestive but not confirmatory.',
                'difficulty' => 'medium', 'type' => 'mcq',
            ],
        ];

        foreach ($questions as $q) {
            $subject = Subject::where('name', $q['subject'])->first();
            $topic = Topic::where('subject_id', $subject->id)->where('name', $q['topic'])->first();

            if ($subject && $topic) {
                Question::create([
                    'subject_id' => $subject->id,
                    'topic_id' => $topic->id,
                    'question_text' => $q['question_text'],
                    'question_type' => $q['type'],
                    'options' => $q['options'],
                    'correct_option' => $q['correct_option'],
                    'explanation' => $q['explanation'],
                    'reference' => 'Harrison\'s / Robbins / KD Tripathi',
                    'learning_point' => 'High-yield FMGE topic',
                    'difficulty' => $q['difficulty'],
                    'status' => 'active',
                    'tags' => ['FMGE', $q['subject']],
                ]);
            }
        }

        // Generate more random questions to fill the bank
        $subjects = Subject::with('topics')->get();
        foreach ($subjects as $subject) {
            foreach ($subject->topics as $topic) {
                // Create 5-10 questions per topic
                $count = rand(5, 10);
                for ($i = 0; $i < $count; $i++) {
                    Question::create([
                        'subject_id' => $subject->id,
                        'topic_id' => $topic->id,
                        'question_text' => "FMGE {$subject->name} - {$topic->name} Question " . ($i + 1) . ": Clinical scenario testing knowledge of key concepts in this area.",
                        'question_type' => ['mcq', 'mcq', 'mcq', 'clinical_scenario'][rand(0, 3)],
                        'options' => [
                            ['key' => 'A', 'text' => 'Option A - Correct answer for this question'],
                            ['key' => 'B', 'text' => 'Option B - Distractor option'],
                            ['key' => 'C', 'text' => 'Option C - Distractor option'],
                            ['key' => 'D', 'text' => 'Option D - Distractor option'],
                        ],
                        'correct_option' => ['A', 'B', 'C', 'D'][rand(0, 3)],
                        'explanation' => "Detailed explanation for this {$topic->name} question. Key concept to remember for FMGE.",
                        'reference' => 'Standard Medical Textbook',
                        'learning_point' => "Important point about {$topic->name}",
                        'difficulty' => ['easy', 'medium', 'hard'][rand(0, 2)],
                        'status' => 'active',
                        'tags' => ['FMGE', $subject->name, $topic->name],
                    ]);
                }
            }
        }
    }
}
