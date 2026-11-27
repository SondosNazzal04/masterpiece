<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Project;
use App\Models\TaskBlocker;
use App\Models\TaskDod;

class Task extends Model
{
    /** @use HasFactory<\Database\Factories\TaskFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'project_id',
        'title',
        'description',
        'status',
        'priority',
        'difficulty',
        'assignee_id',
        'due_date',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'difficulty' => 'integer',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function blockers(): HasMany
    {
        return $this->hasMany(TaskBlocker::class);
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(TaskDod::class);
    }
}
