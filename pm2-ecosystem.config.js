// PM2 Ecosystem Configuration for KSS
// Usage: pm2 start pm2-ecosystem.config.js
// App root: /var/www/kss/kss (git clone creates kss/ subfolder)

module.exports = {
  apps: [
    {
      name: 'kss-backend',
      script: './backend/src/server.js',
      cwd: '/var/www/kss/kss',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Logging
      error_file: '/var/www/kss/kss/backend/logs/pm2-error.log',
      out_file: '/var/www/kss/kss/backend/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto restart
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      
      // Watch (disable in production)
      watch: false,
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Advanced
      node_args: '--max-old-space-size=1024',
      instance_var: 'INSTANCE_ID'
    }
  ]
};
