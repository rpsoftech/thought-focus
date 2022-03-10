module.exports = {
  apps: [
    {
      name: 'POC UI',
      script: './dist/apps/poc-chatapplication/server/main.js',
      env: {
        NODE_ENV: 'POc',
        PORT: 3000,
      },
    },
    {
      name: 'POC UI',
      script: './dist/apps/simple-socketio/main.js',
      env: {
        NODE_ENV: 'POc',
        PORT: 3001,
      },
    },
  ],
};
