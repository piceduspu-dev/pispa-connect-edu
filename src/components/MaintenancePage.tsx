'use client';

import { useEffect } from 'react';

export default function MaintenancePage() {
  useEffect(() => {
    // Disable all navigation and interactions
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Disable all form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
      });
    });

    // Disable all buttons
    const buttons = document.querySelectorAll('button, a, input[type="submit"]');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-pispa-primary rounded-full mb-6">
            <i className="fas fa-tools text-white text-3xl"></i>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          PISPA Connect
        </h1>

        <h2 className="text-2xl font-semibold text-pispa-primary mb-6">
          Under Maintenance
        </h2>

        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          PISPA Connect is currently undergoing scheduled maintenance to improve your experience.
          The system will be back online shortly. Thank you for your patience.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <i className="fas fa-clock"></i>
              <span>Started: {new Date().toLocaleString('en-US', {
                timeZone: 'Asia/Kuala_Lumpur',
                dateStyle: 'medium',
                timeStyle: 'short'
              })}</span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <i className="fas fa-info-circle"></i>
            <span>Please check back later</span>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-center space-x-6 text-gray-400">
            <i className="fas fa-shield-alt text-2xl"></i>
            <i className="fas fa-graduation-cap text-2xl"></i>
            <i className="fas fa-users text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Prevent interaction overlay */}
      <div
        className="absolute inset-0 z-20"
        style={{ pointerEvents: 'auto' }}
        onContextMenu={(e) => e.preventDefault()}
      ></div>
    </div>
  );
}