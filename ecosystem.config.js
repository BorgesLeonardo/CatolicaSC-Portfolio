module.exports = {
  apps: [
    {
      name: "api-backend",
      script: "backend/dist/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: { NODE_ENV: "production" },
      env_production: { NODE_ENV: "production" }
    }
  ],
  deploy: {
    production: {
      user: "ubuntu",
      host: "15.228.60.7",
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

