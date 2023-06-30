require('dotenv').config();
const snowflake = require('snowflake-sdk');
const fs = require('fs');
const { getSecret } = require('./keyvault');

async function getPrivateKeyFromKeyVault() {
  const secretName = process.env.KEY_VAULT_SECRET_SF_PRIVATE_KEY;
  const keyVaultName = process.env.KEY_VAULT_NAME;

  if (!secretName || !keyVaultName) throw Error('getSecret: Required params missing');

  // Fetch private key from Key Vault
  const privateKeyBase64 = await getSecret(secretName, keyVaultName)
  const privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf-8');
  return privateKey //.replace(/ /g, '\n');;
}

async function getSnowflakeConnection() {
  if (!process.env.SNOWFLAKE_PRIVATE_KEY) {
    const privateKey = await getPrivateKeyFromKeyVault();
    process.env.SNOWFLAKE_PRIVATE_KEY = privateKey;
    
    if (!process.env.SNOWFLAKE_PRIVATE_KEY) {
      throw new Error('No value in SNOWFLAKE_PRIVATE_KEY in env var');
    }
  }

  // Fetch passphrase from Key Vault if needed
  if (process.env.KEY_VAULT_SECRET_NAME_PASSPHRASE) {
    const passphrase = await getSecret(process.env.KEY_VAULT_SECRET_NAME_PASSPHRASE, process.env.KEY_VAULT_NAME);
    process.env.SNOWFLAKE_PASSPHRASE = passphrase;
  }

  // Create the connection pool instance
  console.log('\n\n\n')
  console.log(process.env.SNOWFLAKE_PRIVATE_KEY)
  console.log('\n\n\n')
  const sfConnectionPool = snowflake.createPool({
    authenticator: 'SNOWFLAKE_JWT',
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USER,
    privateKey: process.env.SNOWFLAKE_PRIVATE_KEY,
    role: process.env.SNOWFLAKE_ROLE,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    database: process.env.SNOWFLAKE_DATABASE,
    schema: process.env.SNOWFLAKE_SCHEMA
  },
  {
    max: process.env.SNOWFLAKE_POOL_MAX,
    min: 0
  });

  return sfConnectionPool
}

module.exports = {
  getSnowflakeConnection,
};
