<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403, 'Superadmin access required.');

        $users = User::orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $users->map(fn ($u) => $this->format($u))]);
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403, 'Superadmin access required.');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', Password::min(8)],
            'role' => ['required', 'in:admin,superadmin'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
        ]);

        return response()->json(['data' => $this->format($user)], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403, 'Superadmin access required.');

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', "unique:users,email,{$user->id}"],
            'role' => ['sometimes', 'in:admin,superadmin'],
        ]);

        $user->update($data);

        return response()->json(['data' => $this->format($user->fresh())]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403, 'Superadmin access required.');
        abort_if($user->id === $request->user()->id, 422, 'Cannot delete your own account.');

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }

    private function format(User $u): array
    {
        return [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role' => $u->role,
            'created_at' => $u->created_at?->toISOString(),
        ];
    }
}
