<?php

namespace App\Constants;

enum RoleEnum: string
{
    case CompanyAdmin = 'company_admin';
    case Screener = 'screener';
    case Hr = 'hr';
    case Candidate = 'candidate';

    /**
     * Roles that a company admin is allowed to create as team members.
     */
    public static function teamRoles(): array
    {
        return [self::Screener, self::Hr];
    }

    /**
     * Plain string values, useful for validation rules (Rule::in).
     */
    public static function values(): array
    {
        return array_map(fn (self $role) => $role->value, self::cases());
    }

    /**
     * Human readable label for the UI.
     */
    public function label(): string
    {
        return match ($this) {
            self::CompanyAdmin => 'Company Admin',
            self::Screener => 'Screener',
            self::Hr => 'HR',
            self::Candidate => 'Candidate',
        };
    }
}