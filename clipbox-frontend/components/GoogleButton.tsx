'use client';

interface GoogleButtonProps {
  onClick: () => void;
}

export default function GoogleButton({ onClick }: GoogleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md transition-colors"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.24 10.21v3.58h6.06c-.28 1.76-1.16 2.98-2.56 3.9-.92.6-2.14 1.1-3.5 1.1-4.2 0-7.6-3.3-7.6-7.6s3.4-7.6 7.6-7.6c2.08 0 3.78.88 4.94 2.04l2.76-2.76C17.64 2.88 15.12 2 12.24 2c-5.5 0-9.96 4.46-9.96 9.96s4.46 9.96 9.96 9.96c3.36 0 6.2-1.68 8.04-4.44 1.92-2.8 2.4-6.72 1.2-9.68H12.24z" />
      </svg>
      Continue with Google
    </button>
  );
}