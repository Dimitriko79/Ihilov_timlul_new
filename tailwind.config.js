/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      fontFamily: {
        'noto': ['"Noto Sans Hebrew"', 'sans-serif'],
        'assistent': ['"Assistant"', 'serif']
      },
      colors: {
        blue: {
          50: '#f0f9ff',
          500: '#50c8e7',
          700: '#00acd8',
          800: '#0093c9',
          1000: '#002f87',
        },
        gray: {
          50: '#f9fafb',
          500: '#d9d9d9',
          600: '#212529',
        },
        red: {
          100: '#fee2e2',
          400: '#f87171',
          500: '#ef4444',
          700: '#b91c1c',
        },
        green: {
          600: '#16a34a',
          700: '#15803d',
        },
        white: '#ffffff',
        black: '#000000',
      },
    },
  },
  plugins: [],
  safelist: [
    // Layout
    'min-h-screen',
    'h-64',
    'h-5',
    'h-2.5',
    'w-full',
    'w-5',
    'max-w-4xl',
    'max-w-6xl',
    'p-4',
    'p-2',
    'p-1',
    'px-4',
    'px-8',
    'py-2',
    'py-3',
    'pb-4',
    'mb-4',
    'mb-6',
    'mr-2',
    'mr-3',
    'mt-1',
    'mt-2',

    // Flexbox & Grid
    'flex',
    'flex-1',
    'grid',
    'grid-cols-1',
    'grid-cols-3',
    'grid-cols-4',
    'gap-4',
    'gap-2',
    'items-center',
    'justify-center',
    'space-y-4',

    // Backgrounds
    'bg-blue-50',
    'bg-blue-700',
    'bg-white',
    'bg-gray-50',
    'bg-gray-200',
    'bg-red-100',
    'bg-green-600',
    'bg-black',
    'bg-opacity-50',

    // Text
    'text-blue-800',
    'text-white',
    'text-gray-500',
    'text-gray-600',
    'text-red-500',
    'text-red-700',
    'text-right',
    'text-left',
    'text-center',
    'text-sm',
    'text-lg',
    'text-2xl',
    'text-3xl',
    'font-medium',

    // Borders
    'border',
    'border-2',
    'border-b-2',
    'border-blue-300',
    'border-blue-400',
    'border-red-400',

    // Rounded
    'rounded-xl',
    'rounded-lg',
    'rounded-full',
    'rounded-md',
    'rounded',
    'rounded-relative',

    // Effects
    'shadow-lg',
    'opacity-50',
    'opacity-25',
    'opacity-75',
    'transition-all',
    'duration-200',
    'duration-300',

    // Hover
    'hover:bg-blue-500',
    'hover:bg-green-700',
    'hover:transform',
    'hover:-translate-y-0.5',
    'hover:shadow-lg',
    'hover:text-red-700',
    'hover:bg-gray-50',
    'hover:bg-gray-100',

    // Focus
    'focus:outline-none',
    'focus:border-blue-500',

    // Disabled
    'disabled:opacity-50',
    'cursor-not-allowed',

    // Animation
    'animate-spin',

    // Position
    'fixed',
    'relative',
    'absolute',
    'inset-0',

    // Display
    'hidden',
    'block',

    // Other
    'overflow-x-auto',
    'overflow-auto',
    'cursor-pointer',
    'break-words',

    // Directions
    'rtl',
    'ltr',

    // Responsive
    'md:p-8',
    'md:p-6',
    'md:text-3xl',
    'md:grid-cols-4',
    'sm:inline'
  ]
};