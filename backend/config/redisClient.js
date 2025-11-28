const redis = require('redis');

const redisClient = redis.createClient({
  url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Fehler', err));

redisClient.connect()
  .then(() => {
    console.log('Mit Redis-Server verbunden');
  })
  .catch((err) => {
    console.error('Fehler bei der Verbindung zu Redis:', err);
  });

module.exports = redisClient;
