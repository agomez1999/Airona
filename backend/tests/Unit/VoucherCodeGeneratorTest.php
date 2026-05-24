<?php

use App\Domains\Vouchers\Services\VoucherCodeGenerator;
use Mockery\MockInterface;

// ---------------------------------------------------------------------------
// The VoucherCodeGenerator::generate() method calls
// Voucher::where('code', $code)->exists() to guarantee uniqueness before
// returning.  Because this is a pure unit test (no database), we alias-mock
// the Voucher model so that `exists()` always returns false (i.e. "not taken").
// ---------------------------------------------------------------------------

/**
 * Build a generator whose Voucher uniqueness check is stubbed out.
 * The alias mock is registered once per process, so we only create it when
 * the class hasn't been loaded yet; subsequent calls reuse the existing alias.
 *
 * @return VoucherCodeGenerator
 */
function makeGenerator(): VoucherCodeGenerator
{
    // Guard: alias mocks must be set up before the real class is autoloaded.
    // Mockery handles this automatically when 'alias:' is used.
    $builder = Mockery::mock('overload:Illuminate\Database\Eloquent\Builder');
    $builder->shouldReceive('exists')->andReturn(false);

    $voucher = Mockery::mock('alias:App\Domains\Vouchers\Models\Voucher');
    $voucher->shouldReceive('where')->andReturn($builder);

    return new VoucherCodeGenerator();
}

// ---------------------------------------------------------------------------
// Format tests
// ---------------------------------------------------------------------------

it('generates a code that matches the AIRONA-XXXX-XXXX-XXXX pattern', function () {
    $generator = makeGenerator();
    $code = $generator->generate();

    expect($code)->toMatch('/^AIRONA-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/');
})->tearDown(fn () => Mockery::close());

it('generates a code that is exactly 21 characters long', function () {
    // AIRONA(6) + -(1) + XXXX(4) + -(1) + XXXX(4) + -(1) + XXXX(4) = 21
    $generator = makeGenerator();
    $code = $generator->generate();

    expect(strlen($code))->toBe(21);
})->tearDown(fn () => Mockery::close());

it('generates a code with the AIRONA- prefix', function () {
    $generator = makeGenerator();
    $code = $generator->generate();

    expect($code)->toStartWith('AIRONA-');
})->tearDown(fn () => Mockery::close());

// ---------------------------------------------------------------------------
// Charset / forbidden-character tests
// ---------------------------------------------------------------------------

it('generates a code that contains no forbidden characters (I, O, 0, 1)', function () {
    $generator = makeGenerator();
    $code = $generator->generate();

    // Strip the static prefix and dashes; examine only the variable segment chars.
    $segments = substr($code, strlen('AIRONA-')); // "XXXX-XXXX-XXXX"
    $chars    = str_replace('-', '', $segments);   // "XXXXXXXXXXXX"

    expect($chars)->not->toContain('I')
        ->and($chars)->not->toContain('O')
        ->and($chars)->not->toContain('0')
        ->and($chars)->not->toContain('1');
})->tearDown(fn () => Mockery::close());

it('uses only characters from the safe charset in the variable segments', function () {
    $safeCharset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $generator   = makeGenerator();
    $code        = $generator->generate();

    $segments = substr($code, strlen('AIRONA-'));
    $chars    = str_replace('-', '', $segments);

    for ($i = 0; $i < strlen($chars); $i++) {
        expect(str_contains($safeCharset, $chars[$i]))->toBeTrue(
            "Character '{$chars[$i]}' at position {$i} is not in the safe charset."
        );
    }
})->tearDown(fn () => Mockery::close());

// ---------------------------------------------------------------------------
// Uniqueness / collision test
// ---------------------------------------------------------------------------

it('generates at least 999 unique codes out of 1000 calls', function () {
    // Re-create the stubs for a batch run.
    $builder = Mockery::mock('overload:Illuminate\Database\Eloquent\Builder');
    $builder->shouldReceive('exists')->andReturn(false);

    $voucher = Mockery::mock('alias:App\Domains\Vouchers\Models\Voucher');
    $voucher->shouldReceive('where')->andReturn($builder);

    $generator = new VoucherCodeGenerator();

    $codes = [];
    for ($i = 0; $i < 1000; $i++) {
        $codes[] = $generator->generate();
    }

    $uniqueCount = count(array_unique($codes));

    expect($uniqueCount)->toBeGreaterThanOrEqual(999);
})->tearDown(fn () => Mockery::close());

// ---------------------------------------------------------------------------
// Interface / return-type contract
// ---------------------------------------------------------------------------

it('returns a string from generate()', function () {
    $generator = makeGenerator();

    expect($generator->generate())->toBeString();
})->tearDown(fn () => Mockery::close());

it('returns a different code on two consecutive calls (statistical sanity)', function () {
    // The charset has 32 symbols and each segment is 4 chars: 32^12 ≈ 1.2 × 10^18
    // possible codes, so two identical consecutive codes is astronomically unlikely.
    $generator = makeGenerator();

    $first  = $generator->generate();
    $second = $generator->generate();

    expect($first)->not->toBe($second);
})->tearDown(fn () => Mockery::close());
