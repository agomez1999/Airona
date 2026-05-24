<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Expire active vouchers past their expiry date — runs daily at 02:00 UTC
Schedule::command('vouchers:expire')->dailyAt('02:00');

// Send 30-day expiry reminder emails — runs daily at 09:00 UTC
Schedule::command('vouchers:send-expiry-reminders')->dailyAt('09:00');
