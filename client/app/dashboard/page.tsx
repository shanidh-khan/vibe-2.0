import React from "react";

export default function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-lg text-gray-700">Welcome to your dashboard! 🎉</p>
        <div className="mt-4">
          <ul className="list-disc ml-6 text-gray-600">
            <li>Sample stat: <span className="font-semibold">42</span></li>
            <li>Another metric: <span className="font-semibold">99%</span></li>
            <li>Quick link: <a href="/app" className="text-blue-600 underline">Home</a></li>
          </ul>
        </div>
      </div>
    </main>
  );
}
