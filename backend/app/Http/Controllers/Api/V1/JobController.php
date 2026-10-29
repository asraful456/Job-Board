<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class JobController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'remote' => ['nullable', 'in:1,true'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $jobs = Job::query()
            ->with('company')
            ->where('status', 'open')
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->when($filters['location'] ?? null, function ($query, $location) {
                $query->where('location', 'like', "%{$location}%");
            })
            ->when($filters['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
            ->when($filters['category'] ?? null, fn ($query, $category) => $query->where('category', $category))
            ->when($filters['salary_min'] ?? null, function ($query, $salary) {
                $query->where(function ($query) use ($salary) {
                    $query->where('salary_min', '>=', $salary)
                        ->orWhere('salary_max', '>=', $salary);
                });
            })
            ->when($filters['remote'] ?? false, fn ($query) => $query->where('location', 'like', '%remote%'))
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => $jobs->items(),
            'current_page' => $jobs->currentPage(),
            'last_page' => $jobs->lastPage(),
            'total' => $jobs->total(),
        ]);
    }

    public function show(Job $job): Job
    {
        return $job->load('company');
    }

    public function companyIndex(Request $request): JsonResponse
    {
        $jobs = Job::query()
            ->where('company_id', $request->user()->company_id)
            ->with('company')
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => $jobs->items(),
            'current_page' => $jobs->currentPage(),
            'last_page' => $jobs->lastPage(),
            'total' => $jobs->total(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->jobRules());
        $job = Job::create([
            ...$validated,
            'company_id' => $request->user()->company_id,
        ]);

        return response()->json($job->load('company'), 201);
    }

    public function companyShow(Request $request, int $job): Job
    {
        return $this->companyJob($request, $job)->load('company');
    }

    public function update(Request $request, int $job): Job
    {
        $job = $this->companyJob($request, $job);
        $validated = $request->validate($this->jobRules(true));
        $job->update($validated);

        return $job->fresh()->load('company');
    }

    public function destroy(Request $request, int $job): JsonResponse
    {
        $this->companyJob($request, $job)->delete();

        return response()->json(['message' => 'Job deleted successfully.']);
    }

    private function companyJob(Request $request, int $job): Job
    {
        return Job::query()
            ->where('company_id', $request->user()->company_id)
            ->findOrFail($job);
    }

    private function jobRules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'title' => [$required, 'string', 'min:2', 'max:255'],
            'category' => [$required, 'string', 'max:100'],
            'type' => [$required, 'string', 'max:100'],
            'location' => [$required, 'string', 'max:255'],
            'salary_min' => [$required, 'nullable', 'integer', 'min:0'],
            'salary_max' => [$required, 'nullable', 'integer', 'min:0'],
            'deadline' => [$required, 'nullable', 'date'],
            'description' => [$required, 'string', 'min:20'],
            'requirements' => [$required, 'nullable', 'string', 'min:10'],
            'status' => [$partial ? 'sometimes' : 'prohibited', Rule::in(['open', 'closed'])],
        ];
    }
}
