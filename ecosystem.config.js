module.exports = {
  apps: [
    {
      name: 'kira-web',
      cwd: './apps/web',
      script: 'node_modules/.bin/next',
      args: 'start -p 4000',
      env: {
        PORT: 4000,
        NODE_ENV: 'production',
      },
      max_restarts: 10,
      restart_delay: 3000,
    },
    {
      name: 'kira-api',
      cwd: './apps/api',
      script: 'dist/src/main.js',
      env: {
        PORT: 4001,
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
      },
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
};
