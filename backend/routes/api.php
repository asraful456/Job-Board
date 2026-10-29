<?php

use App\Http\Controllers\Api\V1\ApplicationController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CompanyController;
use App\Http\Controllers\Api\V1\HrController;
use App\Http\Controllers\Api\V1\JobController;
use App\Http\Controllers\Api\V1\ScreenerController;
use Illuminate\Support\Facades\Route;

// Public job endpoints
Route::get('/jobs', [JobController::class, 'index']);
Route::get('/jobs/{job}', [JobController::class, 'show']);
Route::get('/applications/{application}/cv', [ApplicationController::class, 'downloadCv'])
    ->middleware('signed')
    ->name('applications.cv');
Route::get('/applications/{application}/cv/preview', [ApplicationController::class, 'previewCv'])
    ->middleware('signed')
    ->name('applications.cv.preview');

// Compatibility routes (routes called directly without /v1/ by frontend)
Route::middleware('auth:api')->group(function () {
    // Company admin workspace routes
    Route::prefix('company')->middleware('role:company_admin')->group(function () {
        Route::get('/dashboard', [CompanyController::class, 'dashboard']);
        Route::get('/team', [CompanyController::class, 'teamIndex']);
        Route::post('/team', [CompanyController::class, 'teamStore']);
        Route::delete('/team/{user}', [CompanyController::class, 'teamDestroy']);
        Route::get('/profile', [CompanyController::class, 'profileShow']);
        Route::match(['patch', 'post'], '/profile', [CompanyController::class, 'profileUpdate']);
    });

    // Screener workspace routes
    Route::prefix('screener')->middleware('role:screener')->group(function () {
        Route::get('/applicants', [ScreenerController::class, 'applicants']);
        Route::get('/jobs', [ScreenerController::class, 'jobs']);
        Route::patch('/applications/{application}', [ScreenerController::class, 'updateApplication']);
    });

    // HR workspace routes
    Route::prefix('hr')->middleware('role:hr')->group(function () {
        Route::get('/candidates', [HrController::class, 'candidates']);
        Route::get('/candidates/{application}', [HrController::class, 'showCandidate']);
        Route::patch('/applications/{application}', [HrController::class, 'updateApplication']);
    });
});

Route::prefix('v1')->group(function () {

    // Public routes
    Route::post('/register/candidate', [AuthController::class, 'registerCandidate']);
    Route::post('/register/company', [AuthController::class, 'registerCompany']);
    Route::post('/login', [AuthController::class, 'login']);

    // Authenticated routes
    Route::middleware('auth:api')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // Candidate routes
        Route::middleware('role:candidate')->group(function () {
            Route::post('/jobs/{job}/apply', [ApplicationController::class, 'store']);
            Route::get('/candidate/applications', [ApplicationController::class, 'candidateIndex']);
        });

        // Company admin routes
        Route::prefix('company')->middleware('role:company_admin')->group(function () {
            Route::get('/dashboard', [CompanyController::class, 'dashboard']);
            Route::get('/team', [CompanyController::class, 'teamIndex']);
            Route::post('/team', [CompanyController::class, 'teamStore']);
            Route::delete('/team/{user}', [CompanyController::class, 'teamDestroy']);
            Route::get('/profile', [CompanyController::class, 'profileShow']);
            Route::match(['patch', 'post'], '/profile', [CompanyController::class, 'profileUpdate']);

            Route::get('/jobs', [JobController::class, 'companyIndex']);
            Route::post('/jobs', [JobController::class, 'store']);
            Route::get('/jobs/{job}', [JobController::class, 'companyShow']);
            Route::put('/jobs/{job}', [JobController::class, 'update']);
            Route::patch('/jobs/{job}', [JobController::class, 'update']);
            Route::delete('/jobs/{job}', [JobController::class, 'destroy']);
        });

        // Screener routes
        Route::prefix('screener')->middleware('role:screener')->group(function () {
            Route::get('/applicants', [ScreenerController::class, 'applicants']);
            Route::get('/jobs', [ScreenerController::class, 'jobs']);
            Route::patch('/applications/{application}', [ScreenerController::class, 'updateApplication']);
        });

        // HR routes
        Route::prefix('hr')->middleware('role:hr')->group(function () {
            Route::get('/candidates', [HrController::class, 'candidates']);
            Route::get('/candidates/{application}', [HrController::class, 'showCandidate']);
            Route::patch('/applications/{application}', [HrController::class, 'updateApplication']);
        });

        // Role test routes
        Route::get('/test/company', fn () => ['ok' => 'company admin area'])
            ->middleware('role:company_admin');
        Route::get('/test/screener', fn () => ['ok' => 'screener area'])
            ->middleware('role:screener');
        Route::get('/test/hr', fn () => ['ok' => 'hr area'])
            ->middleware('role:hr');
        Route::get('/test/candidate', fn () => ['ok' => 'candidate area'])
            ->middleware('role:candidate');
    });
});
