 const axios = require('axios');
 const db = require('./db');

 const DEFAULT_TIMEOUT = 1000;

 async function callService(serviceName, url, {timeout = DEFAULT_TIMEOUT} = {}) {

  const health = await db.get("SELECT status from health where service = ?", [serviceName])

  if (health && health.status === 'fail') {
    const error = new Error(`${serviceName} service Unaviaable {circuit open}` )
    error.circuitOpen = true;
    throw error;
  }

  try {
    const res = await axios.get(url, {timeout})
    return res.data;
  } catch(err) {
    await db.run(
      `INSERT INTO health (service, status) VALUES (?, 'fail)
       ON CONFLICT (service) DO UPDATE SET status = excluded.status`,
       [serviceName]
    );
    e.downstreamFailed = true;
    throw e
  }
 }


 module.exports = {DEFAULT_TIMEOUT, callService}