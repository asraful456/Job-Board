<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HrController extends Controller
{
    /**
     * Get candidate applications for HR decision (filtered by company).
     */
    public function candidates(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $request->validate([
            'status' => ['nullable', 'string', Rule::in(['shortlisted', 'accepted', 'rejected'])],
        ]);

        $companyJobIds = Job::where('company_id', $companyId)->pluck('id');

        $query = Application::query()
            ->whereIn('job_id', $companyJobIds)
            ->with(['job.company', 'candidate', 'shortlistedBy']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $applications = $query->latest()->get();

        return response()->json(ApplicationResource::collection($applications)->resolve());
    }

    /**
     * View details of a specific application/candidate for HR.
     */
    public function showCandidate(Request $request, Application $application): JsonResponse
    {
        $companyId = $request->user()->company_id;

        if ($application->job->company_id !== $companyId) {
            abort(403, 'Unauthorized action.');
        }

        return response()->json(new ApplicationResource($application->load(['job.company', 'candidate', 'shortlistedBy'])));
    }

    /**
     * Update application status with hiring decision (accepted or rejected).
     */
    public function updateApplication(Request $request, Application $application): JsonResponse
    {
        $companyId = $request->user()->company_id;

        if ($application->job->company_id !== $companyId) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['accepted', 'rejected'])],
            'rejection_reason' => ['nullable', 'string', 'max:5000'],
        ]);

        $application->update([
            'status' => $validated['status'],
            'rejection_reason' => $validated['status'] === 'rejected' ? ($validated['rejection_reason'] ?? null) : null,
        ]);

        return response()->json(new ApplicationResource($application->fresh(['job.company', 'candidate', 'shortlistedBy'])));
    }
}
