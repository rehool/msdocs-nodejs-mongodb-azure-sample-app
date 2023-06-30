const express = require('express');
const router = express.Router();
const { getSnowflakeConnection } = require('../snowflake_connection');

// Simple test script to verify connection to Snowflake
router.get('/top5rows', async function(req, res, next) {
    try {
        const connPool = await getSnowflakeConnection();

        const sqlText = "SELECT * FROM OTHER.AGG_SCA_DATA LIMIT 5";

        const result = await connPool.execute({ sqlText });

        const rows = result.map(row => {
            return {
                FILE_SOURCE: row.FILE_SOURCE,
                SOURCE_DATE: row.SOURCE_DATE,
                YEAR: row.YEAR,
                HALF: row.HALF,
                VAR: row.VAR,
                VALUE: row.VALUE
            };
        });

        res.json(rows);

    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;