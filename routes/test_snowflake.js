const express = require('express');
const router = express.Router();
const { getSnowflakeConnection } = require('../config/snowflake_connection');

// Simple test script to verify connection to Snowflake
router.get('/top5rows', async function(req, res, next) {

    // const rows = result.map(row => {
    //     return {
    //         FILE_SOURCE: row.FILE_SOURCE,
    //         SOURCE_DATE: row.SOURCE_DATE,
    //         YEAR: row.YEAR,
    //         HALF: row.HALF,
    //         VAR: row.VAR,
    //         VALUE: row.VALUE
    //     };
    // });

    // res.json(rows);
    try {
        const connectionPool = await getSnowflakeConnection();
        const sqlText = "SELECT * FROM OTHER.AGG_SCA_DATA LIMIT 5;";
        const queryResult = [];
    
        await connectionPool.use(async (clientConnection) => {
          const statement = await clientConnection.execute({
            sqlText: sqlText,
            complete: function(err, stmt, rows) {
              if (err) {
                console.error('There was an error executing the query:', err);
                res.status(500).send('Error executing query');
              } else {
                var stream = stmt.streamRows();
                stream.on('data', function(row) {
                  queryResult.push(row);
                });
                stream.on('end', function() {
                  res.json(queryResult);
                });
              }
            }
          });
        });
    
      } catch (err) {
        console.error(err);
        res.status(500).send('Error connecting to Snowflake');
      }

});

module.exports = router;