const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join, resolve } = require('path');
const { scopedPreflightStyles, isolateOutsideOfContainer } = require(resolve(
  __dirname,
  '../../tools/tailwind/scoped-preflight.ts'
));

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    'libs/**/!(*.stories|*.spec).{html,ts}',
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',

        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',

        // Blue and Green
        'theme-blue': 'var(--blue)',
        'theme-blue-foreground': 'var(--blue-foreground)',
        'theme-green': 'var(--green)',
        'theme-green-foreground': 'var(--green-foreground)',

        // Material
        'material-primary': 'var(--material-primary)',
        'material-primary-foreground': 'var(--material-primary-foreground)',
        'material-accent': 'var(--material-accent)',
        'material-accent-foreground': 'var(--material-accent-foreground)',

        // Sidebar
        sidebar: 'var(--sidebar)',
        'sidebar-foreground': 'var(--sidebar-foreground)',
        'sidebar-primary': 'var(--sidebar-primary)',
        'sidebar-primary-foreground': 'var(--sidebar-primary-foreground)',
        'sidebar-accent': 'var(--sidebar-accent)',
        'sidebar-accent-foreground': 'var(--sidebar-accent-foreground)',
        'sidebar-border': 'var(--sidebar-border)',
        'sidebar-ring': 'var(--sidebar-ring)',
      },
      boxShadow: {
        'elevation-1': 'var(--shadow-elevation-1)',
        'elevation-2': 'var(--shadow-elevation-2)',
        'elevation-3': 'var(--shadow-elevation-3)',
      },
    },
  },
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateOutsideOfContainer('.no-twp'),
    }),
  ],
};
