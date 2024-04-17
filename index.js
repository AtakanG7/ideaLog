const express = require('express');
const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

app.use(express.static('public'))

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.render('pages/index')
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
