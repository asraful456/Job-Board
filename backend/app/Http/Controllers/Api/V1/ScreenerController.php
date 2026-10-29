<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ScreenerController extends Controller
{
    /**
     * Get applications for screener review (filtered by company).
     */
    public function applicants(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $request->validate([
            'job_id' => ['nullable', 'integer'],
            'status' => ['nullable', 'string', Rule::in(['applied', 'shortlisted', 'screening_rejected'])],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $companyJobIds = Job::where('company_id', $companyId)->pluck('id');

        $query = Application::query()
            ->whereIn('job_id', $companyJobIds)
            ->with(['job.company', 'candidate', 'shortlistedBy']);

        if ($request->filled('job_id')) {
            $query->where('job_id', $request->query('job_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->whereHas('candidate', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $applications = $query->latest()->get();

        return response()->json(ApplicationResource::collection($applications)->resolve());
    }

    /**
     * Get company jobs for screener filter dropdown.
     */
    public function jobs(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $jobs = Job::where('company_id', $companyId)->latest()->get();

        return response()->json($jobs);
    }

    /**
     * Update application status (shortlisted or screening_rejected).
     */
    public function updateApplication(Request $request, Application $application): JsonResponse
    {
        $companyId = $request->user()->company_id;

        // Ensure the application belongs to a job in the screener's company
        if ($application->job->company_id !== $companyId) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['shortlisted', 'screening_rejected'])],
        ]);

        $updates = [
            'status' => $validated['status'],
        ];

        if ($validated['status'] === 'shortlisted') {
            $updates['shortlisted_at'] = now();
            $updates['shortlisted_by'] = $request->user()->id;
        }

        $application->update($updates);

        return response()->json(new ApplicationResource($application->fresh(['job.company', 'candidate', 'shortlistedBy'])));
    }
}
