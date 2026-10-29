<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ApplicationController extends Controller
{
    public function store(Request $request, Job $job): JsonResponse
    {
        abort_unless($job->status === 'open', 409, 'This job is no longer accepting applications.');
        abort_if(
            $job->deadline && $job->deadline->copy()->endOfDay()->isPast(),
            409,
            'The application deadline has passed.',
        );
        abort_if(
            Application::where('job_id', $job->id)->where('user_id', $request->user()->id)->exists(),
            409,
            'You have already applied for this job.',
        );

        $validated = $request->validate([
            'cv' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:2048'],
            'phone' => ['nullable', 'string', 'max:20'],
            'cover_letter' => ['nullable', 'string', 'max:5000'],
        ]);

        $cvPath = $request->file('cv')->store('applications', 'local');

        try {
            $application = DB::transaction(fn () => Application::create([
                'job_id' => $job->id,
                'user_id' => $request->user()->id,
                'status' => 'applied',
                'cover_letter' => $validated['cover_letter'] ?? null,
                'cv_path' => $cvPath,
                'phone' => $validated['phone'] ?? null,
            ]));
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($cvPath);
            throw $exception;
        }

        return response()->json(new ApplicationResource($application->load('job.company')), 201);
    }

    public function candidateIndex(Request $request): JsonResponse
    {
        $applications = Application::query()
            ->where('user_id', $request->user()->id)
            ->with(['job.company'])
            ->latest()
            ->get();

        return response()->json(ApplicationResource::collection($applications)->resolve());
    }

    public function downloadCv(Application $application): StreamedResponse
    {
        abort_unless(Storage::disk('local')->exists($application->cv_path), 404);

        return Storage::disk('local')->download($application->cv_path);
    }

    public function previewCv(Application $application): StreamedResponse
    {
        $disk = Storage::disk('local');
        abort_unless($disk->exists($application->cv_path), 404);

        return $disk->response(
            $application->cv_path,
            basename($application->cv_path),
            ['X-Content-Type-Options' => 'nosniff'],
            'inline',
        );
    }
}
