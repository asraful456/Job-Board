<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    protected $fillable = [
        'job_id',
        'user_id',
        'status',
        'cover_letter',
        'cv_path',
        'phone',
        'shortlisted_at',
        'rejection_reason',
        'shortlisted_by',
    ];

    protected $hidden = ['cv_path'];

    protected function casts(): array
    {
        return [
            'shortlisted_at' => 'datetime',
        ];
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function shortlistedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shortlisted_by');
    }
}
