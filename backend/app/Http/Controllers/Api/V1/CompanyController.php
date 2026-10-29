<?php

namespace App\Http\Controllers\Api\V1;

use App\Constants\RoleEnum;
use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Http\Resources\CompanyResource;
use App\Http\Resources\UserResource;
use App\Models\Application;
use App\Models\Company;
use App\Models\Job;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CompanyController extends Controller
{
    /**
     * Get company hiring dashboard statistics.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $jobIds = Job::where('company_id', $companyId)->pluck('id');

        $totalJobs = $jobIds->count();
        $totalApplicants = Application::whereIn('job_id', $jobIds)->count();
        $shortlisted = Application::whereIn('job_id', $jobIds)->where('status', 'shortlisted')->count();
        $accepted = Application::whereIn('job_id', $jobIds)->where('status', 'accepted')->count();

        $recentApplications = Application::whereIn('job_id', $jobIds)
            ->with(['job.company', 'candidate'])
            ->latest()
            ->take(5)
            ->get();

        $company = Company::find($companyId);

        return response()->json([
            'company' => $company ? new CompanyResource($company) : null,
            'total_jobs' => $totalJobs,
            'total_applicants' => $totalApplicants,
            'shortlisted' => $shortlisted,
            'accepted' => $accepted,
            'recent_applications' => ApplicationResource::collection($recentApplications)->resolve(),
        ]);
    }

    /**
     * List all team members of this company (screeners & HR).
     */
    public function teamIndex(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $members = User::where('company_id', $companyId)
            ->whereIn('role', [RoleEnum::Screener, RoleEnum::Hr])
            ->latest()
            ->get();

        return response()->json(UserResource::collection($members)->resolve());
    }

    /**
     * Create a new team member (screener or hr).
     */
    public function teamStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', Rule::in(['screener', 'hr'])],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => RoleEnum::from($validated['role']),
            'company_id' => $request->user()->company_id,
        ]);

        return response()->json(new UserResource($user), 201);
    }

    /**
     * Delete a team member belonging to this company.
     */
    public function teamDestroy(Request $request, User $user): JsonResponse
    {
        $companyId = $request->user()->company_id;

        if ($user->company_id !== $companyId || !in_array($user->role, [RoleEnum::Screener, RoleEnum::Hr])) {
            abort(403, 'Unauthorized action.');
        }

        $user->delete();

        return response()->json(['message' => 'Team member removed successfully.']);
    }

    /**
     * Get company profile.
     */
    public function profileShow(Request $request): JsonResponse
    {
        $company = Company::findOrFail($request->user()->company_id);

        return response()->json(new CompanyResource($company));
    }

    /**
     * Update company profile (including logo upload).
     */
    public function profileUpdate(Request $request): JsonResponse
    {
        $company = Company::findOrFail($request->user()->company_id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'about' => ['nullable', 'string', 'max:5000'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,webp,jpg', 'max:2048'],
        ]);

        if ($request->hasFile('logo')) {
            if ($company->logo && Storage::disk('public')->exists($company->logo)) {
                Storage::disk('public')->delete($company->logo);
            }
            $validated['logo'] = $request->file('logo')->store('companies', 'public');
        }

        $company->update($validated);

        return response()->json(new CompanyResource($company->fresh()));
    }
}
