module.exports = {
  apps : [
    {
      name      : 'PorjectM',
      script    : 'bin/www',
      env: {
      },
      env_production : {
        NODE_ENV: 'production'
      }
    }
  ],
  deploy : {
    production : {
      key : '/var/www/vhosts/mapcode.ir/.ssh/id_rsa',
      user : 'arshingolabchi1',
      host : '188.40.89.142',
      ref  : 'origin/master',
      repo : 'git@gitlab.com:ProjectM/src.git',
      path : '/var/www/vhosts/mapcode.ir',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
