'use client';

import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import {
  BellIcon,
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Search bar placeholder - can be implemented later */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
          {/* This space can be used for search or breadcrumbs later */}
        </div>
      </div>

      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Notifications button */}
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Separator */}
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

        {/* Profile dropdown */}
        <Menu as="div" className="relative">
          <Menu.Button className="-m-1.5 flex items-center p-1.5">
            <span className="sr-only">Open user menu</span>
            <div className="flex items-center">
              {user?.profile.avatar_url ? (
                <Image
                  className="h-8 w-8 rounded-full bg-gray-50"
                  src={user.profile.avatar_url}
                  alt={user.profile.full_name}
                  width={32}
                  height={32}
                />
              ) : (
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              )}
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                  {user?.profile.full_name}
                </span>
                <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </div>
          </Menu.Button>
          
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2.5 w-64 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
              {/* User info section */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.profile.full_name}
                </p>
                <p className="text-sm text-gray-500">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-400 capitalize mt-1">
                  {user?.role}
                  {user?.profile.department && ` • ${user.profile.department}`}
                </p>
              </div>

              {/* Menu items */}
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={classNames(
                      active ? 'bg-gray-50' : '',
                      'flex w-full items-center px-4 py-2 text-sm text-gray-700'
                    )}
                  >
                    <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                    Profil Saya
                  </button>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <button
                    className={classNames(
                      active ? 'bg-gray-50' : '',
                      'flex w-full items-center px-4 py-2 text-sm text-gray-700'
                    )}
                  >
                    <CogIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                    Pengaturan
                  </button>
                )}
              </Menu.Item>

              <div className="border-t border-gray-100 my-1" />

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={classNames(
                      active ? 'bg-gray-50' : '',
                      'flex w-full items-center px-4 py-2 text-sm text-gray-700 disabled:opacity-50'
                    )}
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                    {isLoggingOut ? (
                      <>
                        <svg className="animate-spin mr-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Keluar...
                      </>
                    ) : (
                      'Keluar'
                    )}
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}