require('dotenv-safe').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = 8000;

app.use(cors());
app.options('*', cors());

app.use(express.urlencoded({ extended: false}));
app.use(express.json());

require("./routes/user_routes.js")(app);

app.get('/', (req, res) => {
    res.send('Hello World, from express');
});
       
app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));
