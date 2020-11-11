require('dotenv-safe').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.APP_PORT;

app.use(cors());
app.options('*', cors());

app.use(express.urlencoded({ extended: false}));
app.use(express.json());

require("./routes/user_routes.js")(app);

app.get('/', (req, res) => {
    res.send('TODO: API Docs');
});
       
app.listen(port, () => console.log(`Nodejs user api app listening on port ${port}!`));
