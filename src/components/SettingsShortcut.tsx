import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SettingsShortcut() {
  const navigate = useNavigate();

  return (
    <button
      aria-label="前往设置"
      onClick={() => navigate('/settings')}
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
    >
      设置
    </button>
  );
}
