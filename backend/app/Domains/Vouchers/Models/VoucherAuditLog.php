<?php

namespace App\Domains\Vouchers\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VoucherAuditLog extends Model
{
    protected $table = 'voucher_audit_log';

    public $timestamps = false;

    protected $fillable = [
        'voucher_id',
        'actor_type',
        'actor_id',
        'action',
        'metadata',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (VoucherAuditLog $log) {
            $log->created_at ??= now();
        });
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
