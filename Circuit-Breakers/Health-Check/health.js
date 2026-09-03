const axios = require('axios');
const db = require('../Shared/db');

const services = {
  posts: {
    name: "posts",
    url: "http://localhost:3002/health"
  },
  comments: {
    name: "comments",
    url: "http://localhost:3001/health"
  },
  users: {
    name: "users",
    url: "http://localhost:3003/health"
  }
}

const healthCheckService = async (service) => {
  const serviceInfo = services[service];

  try {
    console.log(`Checking health of ${serviceInfo.name} at ${serviceInfo.url}`)
    const response = await axios.get(serviceInfo.url, {timeout: 2000});
    console.log(`Response from ${serviceInfo.name} : ${response.data.healthy}`);

    if (response.status !== 200 || !response.data.healthy) {
      await db.run(`INSERT INTO health (service, status) VALUE (?, ?) ON CONFLICT (service) DO UPDATE SET status= excluded.status`, [serviceInfo.name, 'fail'])
      return {
        service: serviceInfo.name, 
        status: 'fail'
      }
    }

    await db.run(`INSERT INTO health (service, status) VALUE (?, ?) ON CONFLICT (service) DO UPDATE SET status= excluded.status`, [serviceInfo.name, 'ok'])
    return {
      service: serviceInfo.name, 
      status: 'ok'
    }
  } catch(err) {
    
    await db.run(`INSERT INTO health (service, status) VALUE (?, ?) ON CONFLICT (service) DO UPDATE SET status= excluded.status`, [serviceInfo.name, 'fail'])
    console.log(`Error checking health of ${serviceInfo.name} : ${console.error});
    }`)
    
    return {
      service: serviceInfo.name, 
      status: 'fail'
    }
  }
}


db.init().then(() => {
  console.log('Health poller started');

  setInterval(async () => {
    for (const service in services) {
      await healthCheckService(service)
    }
  }, 10000)
})