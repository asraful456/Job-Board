<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterCandidateRequest;
use App\Http\Requests\Auth\RegisterCompanyRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService)
    {
    }

    public function registerCandidate(RegisterCandidateRequest $request): JsonResponse
    {
        $result = $this->authService->registerCandidate($request->validated());

        return $this->authResponse($result, 201);
    }

    public function registerCompany(RegisterCompanyRequest $request): JsonResponse
    {
        $result = $this->authService->registerCompany($request->validated());

        return $this->authResponse($result, 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return $this->authResponse($result);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($this->authService->me($request->user()));
    }

    /**
     * Shared response shape for register and login.
     */
    private function authResponse(array $result, int $status = 200): JsonResponse
    {
        return response()->json([
            'user'  => new UserResource($result['user']),
            'token' => $result['token'],
        ], $status);
    }
}