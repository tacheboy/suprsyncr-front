// src/components/layout/Topbar.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/services/authApi';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { LogOut, User, Settings } from 'lucide-react';

export function Topbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      dispatch(logout());
      router.push('/login');
    }
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-6 sticky top-0 z-30 transition-all"
      style={{
        background: 'var(--bg-white)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback
                  className="font-semibold text-sm"
                  style={{
                    background: 'var(--bg-muted)',
                    color: 'var(--text-heading)',
                  }}
                >
                  {user ? getInitials(user.fullName) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>
                  {user?.fullName}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings/warehouses')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
