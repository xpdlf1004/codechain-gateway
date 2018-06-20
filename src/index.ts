import * as express from "express";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";

const runWebServer = () => {
    const app = express();

    app.use(morgan("dev"));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Router
    app.use("/", (req, res, next) => {
        res.send("Hello, world!");
    });

    app.use((req, res, next) => {
        res.status(404).send("Not Found");
    });

    app.listen(3000, function() {
        console.log('Express server listening on port 3000');
    });
};

runWebServer();
