<?php

namespace App\Http\Middleware;

use App\Constants\RoleEnum;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Usage in routes: ->middleware('role:hr') or ->middleware('role:hr,screener')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // RoleEnum::from() throws on an unknown role name,
        // so a typo in a route definition is caught immediately.
        $allowedRoles = array_map(fn (string $role) => RoleEnum::from($role), $roles);

        if (! $user || ! $user->hasRole(...$allowedRoles)) {
            abort(403, 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}