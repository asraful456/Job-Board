<?php

namespace App\Models;

use App\Constants\RoleEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'company_id', 'phone',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            // $user->role now returns a RoleEnum instead of a plain string
            'role' => RoleEnum::class,
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Check if the user has at least one of the given roles.
     */
    public function hasRole(RoleEnum ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    public function isCompanyAdmin(): bool
    {
        return $this->hasRole(RoleEnum::CompanyAdmin);
    }

    public function isScreener(): bool
    {
        return $this->hasRole(RoleEnum::Screener);
    }

    public function isHr(): bool
    {
        return $this->hasRole(RoleEnum::Hr);
    }

    public function isCandidate(): bool
    {
        return $this->hasRole(RoleEnum::Candidate);
    }
}