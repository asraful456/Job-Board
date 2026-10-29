<?php

namespace App\Services;

use App\Constants\RoleEnum;
use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Register a candidate (job seeker).
     */
    public function registerCandidate(array $data): array
    {
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'phone'    => $data['phone'] ?? null,
            'password' => $data['password'], // hashed automatically by the model cast
            'role'     => RoleEnum::Candidate,
        ]);

        return $this->buildAuthPayload($user);
    }

    /**
     * Register a company together with its first admin user.
     * A transaction guarantees both records are created or none.
     */
    public function registerCompany(array $data): array
    {
        $user = DB::transaction(function () use ($data) {
            $company = Company::create([
                'name' => $data['company_name'],
            ]);

            return User::create([
                'name'       => $data['name'],
                'email'      => $data['email'],
                'phone'      => $data['phone'] ?? null,
                'password'   => $data['password'],
                'role'       => RoleEnum::CompanyAdmin,
                'company_id' => $company->id,
            ]);
        });

        return $this->buildAuthPayload($user);
    }

    /**
     * Verify credentials and issue a new access token.
     */
    public function login(array $data): array
    {
        $user = User::where('email', $data['email'])->first();

        // Same error for "no user" and "wrong password" so attackers
        // cannot find out which emails are registered.
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email or password is incorrect.'],
            ]);
        }

        return $this->buildAuthPayload($user);
    }

    /**
     * Revoke the token used for the current request.
     */
    public function logout(User $user): void
    {
        $user->token()->revoke();
    }

    /**
     * Return the current user together with the company.
     */
    public function me(User $user): User
    {
        return $user->load('company');
    }

    /**
     * Build the response array: user + fresh access token.
     */
    private function buildAuthPayload(User $user): array
    {
        return [
            'user'  => $user->load('company'),
            'token' => $user->createToken('auth_token')->accessToken,
        ];
    }
}