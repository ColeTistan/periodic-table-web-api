const express = require("express");
const elementsRouter = require("./elements/elements.routes");
const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(elementsRouter);

app.listen(port, () => {
    console.info(`Running on http://localhost:${port}...`);
});
