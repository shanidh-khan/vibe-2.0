"use client"
import React from "react";

export default function AuthPage() {
    const handleAuthentication = async () => {
        if (typeof window === "undefined") return;
    
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
      };
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-10 flex flex-col items-center w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Sign in to Mocket</h1>
        <button
          className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow hover:shadow-md transition font-medium text-gray-800 dark:text-gray-200 focus:outline-none"
          onClick={handleAuthentication}
        >
          <svg width="24" height="24" viewBox="0 0 48 48" className="inline-block" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_17_40)">
              <path d="M44.5 20H24V28.5H36.8C35.5 32.2 32.1 34.5 28 34.5C23 34.5 19 30.5 19 25.5C19 20.5 23 16.5 28 16.5C29.9 16.5 31.6 17.1 33 18.1L38.1 13C35.5 10.7 32 9.5 28 9.5C18.6 9.5 11 17.1 11 25.5C11 33.9 18.6 41.5 28 41.5C37.4 41.5 45 33.9 45 25.5C45 24.2 44.8 22.9 44.5 20Z" fill="#4285F4"/>
              <path d="M6.3 14.1L12.1 18.2C13.9 15.1 17.6 12.5 22 12.5C24.2 12.5 26.3 13.2 28 14.4L33.1 9.3C29.8 6.9 25.5 5.5 22 5.5C14.2 5.5 7.6 10.9 6.3 14.1Z" fill="#34A853"/>
              <path d="M28 41.5C32.1 41.5 35.5 40.2 38.1 38.1L32.7 33.5C31.2 34.5 29.5 35.1 28 35.1C23.3 35.1 19.4 31.6 19.1 27.5H11.3V32.1C13.7 36.2 20.1 41.5 28 41.5Z" fill="#FBBC05"/>
              <path d="M44.5 20H24V28.5H36.8C36.5 29.7 36 30.8 35.3 31.7L35.4 31.8L39.8 35.5C41.6 33.5 43 30.8 44.5 28.5C45.2 27.2 45.5 25.9 45.5 24.5C45.5 23.1 45.2 21.8 44.5 20Z" fill="#EA4335"/>
            </g>
            <defs>
              <clipPath id="clip0_17_40">
                <rect width="48" height="48" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
