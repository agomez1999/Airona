<?php

return [
    'validity_days' => (int) env('VOUCHER_VALIDITY_DAYS', 365),
    'download_url_ttl_hours' => (int) env('VOUCHER_DOWNLOAD_URL_TTL_HOURS', 72),
    'pdf_storage_path' => env('VOUCHER_PDF_STORAGE_PATH', 'vouchers'),
    'code_prefix' => 'AIRONA',
    // Safe charset: excludes I, O, 0, 1 to prevent confusion when read aloud
    'code_charset' => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
    'code_segments' => 3,
    'code_segment_length' => 4,
];
