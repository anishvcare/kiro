<?php

use Illuminate\Support\Facades\Schedule;

// Generate daily tests at 8:00 AM
Schedule::command('tests:generate-daily')->dailyAt('08:00');

// TODO: Add notification commands when Firebase is configured
// Schedule::command('notifications:send-morning')->dailyAt('08:55');
// Schedule::command('notifications:send-evening')->dailyAt('18:55');
