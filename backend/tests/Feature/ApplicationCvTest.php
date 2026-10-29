<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Company;
use App\Models\Job;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class ApplicationCvTest extends TestCase
{
    use RefreshDatabase;

    public function test_signed_cv_preview_is_inline_and_download_stays_an_attachment(): void
    {
        Storage::fake('local');

        $company = Company::create(['name' => 'Example Company']);
        $candidate = User::create([
            'name' => 'Example Candidate',
            'email' => 'candidate@example.test',
            'password' => 'password',
        ]);
        $job = Job::create([
            'company_id' => $company->id,
            'title' => 'Example role',
            'description' => 'Example description',
            'type' => 'Full-time',
            'location' => 'Remote',
        ]);
        $cvPath = 'applications/candidate-resume.pdf';
        Storage::disk('local')->put($cvPath, "%PDF-1.4\nExample resume");
        $application = Application::create([
            'job_id' => $job->id,
            'user_id' => $candidate->id,
            'cv_path' => $cvPath,
        ]);

        $previewUrl = URL::temporarySignedRoute(
            'applications.cv.preview',
            now()->addMinute(),
            ['application' => $application->id],
        );
        $previewResponse = $this->get($previewUrl);

        $previewResponse->assertOk();
        self::assertStringContainsString(
            'inline',
            $previewResponse->headers->get('Content-Disposition'),
        );
        self::assertStringContainsString(
            'candidate-resume.pdf',
            $previewResponse->headers->get('Content-Disposition'),
        );

        $downloadUrl = URL::temporarySignedRoute(
            'applications.cv',
            now()->addMinute(),
            ['application' => $application->id],
        );
        $downloadResponse = $this->get($downloadUrl);

        $downloadResponse->assertOk();
        self::assertStringContainsString(
            'attachment',
            $downloadResponse->headers->get('Content-Disposition'),
        );
    }
}
