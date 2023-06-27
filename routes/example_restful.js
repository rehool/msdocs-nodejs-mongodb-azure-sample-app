const express = require('express');
const router = express.Router();

router.get('/home/example_json', (req, res) => {
    const data = [
        {
            "role": "user",
            "numbers": 1234
        },
        {
            "role": "admin",
            "numbers": 345
        }
    ];
    res.json(data);
});

module.exports = router;
