module.exports = {
  apps: [
    {
      name: "api-backend",
      cwd: "backend",
      script: "dist/server.js",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production", DOTENV_CONFIG_PATH: "backend/.env" },
      env_production: { NODE_ENV: "production", DOTENV_CONFIG_PATH: "backend/.env" }
    }
  ],
  deploy: {
    production: {
      user: "ubuntu",
      host: "18.228.241.117",
      ref: "origin/main",
      repo: "git@github.com:BorgesLeonardo/CatolicaSC-Portfolio.git",
      path: "/var/www/api-backend",
      ssh_options: ["StrictHostKeyChecking=accept-new"],
      "pre-deploy": "mkdir -p /var/www/shared",
      "post-deploy": [
        "cp -n /var/www/shared/.env backend/.env || true",
        "npm ci --prefix backend",
        "npm run build --prefix backend",
        "npm prune --omit=dev --prefix backend",
        "pm2 startOrReload ecosystem.config.js --env production"
      ].join(" && ")
    }
  }
}

