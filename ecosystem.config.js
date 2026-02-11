module.exports = {
  apps: [
    {
      name: 'kira-web',
      cwd: '/home/kira/kira-dashboard-v2/apps/web',
      script: 'npm',
      args: 'exec next start -- -p 4000',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/tmp/kira-web-error.log',
      out_file: '/tmp/kira-web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_memory_restart: '1G',
    },
    {
      name: 'kira-api',
      cwd: '/home/kira/kira-dashboard-v2/apps/api',
      script: 'npm',
      args: 'run start:prod',
      env: {
        NODE_ENV: 'production',
        PORT: '4001',
      },
      error_file: '/tmp/kira-api-error.log',
      out_file: '/tmp/kira-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_memory_restart: '512M',
    },
  ],
};
