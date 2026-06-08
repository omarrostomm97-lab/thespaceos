module.exports = {
  apps: [
    {
      name: "thespaceos-api",
      script: "artifacts/api-server/dist/index.mjs",
      cwd: "/var/www/thespaceos",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
      env_file: "/var/www/thespaceos/.env",
      error_file: "/var/log/thespaceos/api-error.log",
      out_file: "/var/log/thespaceos/api-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
