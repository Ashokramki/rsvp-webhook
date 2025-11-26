const express = require('express');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const PORT = process.env.PORT || 3000;

const csvWriter = createCsvWriter({
    path: 'rsvp_responses.csv',
    header: [
        {id: 'name', title: 'Name'},
        {id: 'response', title: 'Response'},
        {id: 'timestamp', title: 'Timestamp'}
    ],
    append: true
});

app.get('/rsvp', async (req, res) => {
    const { name, response, token } = req.query;

    if (!token || token !== process.env.SECRET_TOKEN) {
        return res.status(403).send('Invalid token.');
    }

    if (!name || !response) {
        return res.status(400).send('Missing parameters.');
    }

    const record = {
        name,
        response: response.toLowerCase() === 'yes' ? 'Yes' : 'No',
        timestamp: new Date().toISOString()
    };

    try {
        await csvWriter.writeRecords([record]);
        console.log(`Recorded response: ${record.name} -> ${record.response}`);
    } catch (err) {
        console.error('Error writing to CSV', err);
        return res.status(500).send('Internal server error');
    }

    res.send(`Thanks ${name}, your response "${record.response}" is recorded.`);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
