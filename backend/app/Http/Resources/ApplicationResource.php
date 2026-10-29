<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'cover_letter' => $this->cover_letter,
            'cv_url' => URL::temporarySignedRoute(
                'applications.cv',
                now()->addMinutes(10),
                ['application' => $this->id],
            ),
            'cv_preview_url' => URL::temporarySignedRoute(
                'applications.cv.preview',
                now()->addMinutes(10),
                ['application' => $this->id],
            ),
            'phone' => $this->phone,
            'created_at' => $this->created_at,
            'shortlisted_at' => $this->shortlisted_at,
            'rejection_reason' => $this->rejection_reason,
            'job' => $this->whenLoaded('job'),
            'candidate' => $this->whenLoaded('candidate'),
            'shortlisted_by' => $this->whenLoaded('shortlistedBy'),
        ];
    }
}
