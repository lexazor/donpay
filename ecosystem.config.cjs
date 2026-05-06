module.exports = {
  apps: [
    {
      name: 'donpay-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run start:prod',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      max_restarts: 10,
      restart_delay: 3000,
    },
    {
      name: 'donpay-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run start -- -p 3000',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
};
