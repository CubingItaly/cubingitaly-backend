#!/usr/bin/env node

import * as http from "http";
import { Database } from './db/database';
import * as express from 'express';
import { Session } from "./db/entity/session.entity";
import * as session from 'express-session';
import { keys } from './secrets/keys';
import { TypeormStore } from "typeorm-store";
import * as passport from 'passport';
import './passport/strategy.passport.wca';
import { json, urlencoded } from 'body-parser';
import * as compression from 'compression';
import * as expressSanitizer from 'express-sanitizer';
import * as helmet from 'helmet';
import * as path from 'path';
//Routes files
import { router as authRoutes } from './api/v0/auth.api';
import { router as articleRoutes } from './api/v0/article.api';
import { router as teamRoutes } from './api/v0/team.api';
import { router as userRoutes } from './api/v0/user.api';
import { router as categoryRoutes } from './api/v0/category.api';
import { router as pageRoutes } from './api/v0/page.api';
import { router as tutorialRoutes } from './api/v0/tutorial.api';
import { router as contactRoutes } from './api/v0/contact.api';
import { router as faqRoutes } from './api/v0/faq.api';
import { router as sitemap } from './api/v0/sitemap.api';
import { router as compRoutes } from './api/v0/competition.api';
import { router as scheduleRoutes } from './api/v0/schedule.api';
import { router as associationRoutes} from './api/v0/association.api';


const PORT = normalizePort(process.env.PORT || 4300);
const db: Database = new Database();
const app = express();
let server;

db.createConnection()
    .then(() => db.initDatabase())
    .then(() => console.log("Connection to DB created"))
    .then(() => {
        setMiddleware()
        addSession();
        addRoutes();
        addStaticFiles();
        setErrorHandlers();
        setPort();
        server = http.createServer(app);
        server.listen(PORT);
        server.on("error", onError);
        server.on("listening", onListening);
    });

function setMiddleware() {
    app.use(helmet());
    app.use(json());
    app.use(compression());
    app.use(urlencoded({ extended: true }));
    app.use(expressSanitizer());
}

function addRoutes() {
    app.use("/api/v0/auth", authRoutes);
    app.use("/api/v0/teams", teamRoutes);
    app.use("/api/v0/users", userRoutes);
    app.use("/api/v0/articles", articleRoutes);
    app.use("/api/v0/categories", categoryRoutes);
    app.use("/api/v0/pages", pageRoutes);
    app.use("/api/v0/tutorial", tutorialRoutes);
    app.use("/api/v0/contact", contactRoutes);
    app.use("/api/v0/faq", faqRoutes);
    app.use("/api/v0/competitions/schedule", scheduleRoutes);
    app.use("/api/v0/competitions", compRoutes);
    app.use("/api/v0/association",associationRoutes);
    app.use("/sitemap", sitemap);
}

function addStaticFiles() {
    if (process.env.NODE_ENV === "production" || process.env.NODE_ENV==="test") {
        //serve static files from client folder
        app.use(express.static(path.join(__dirname, "/../client")));
        //serve static files from upload folder
        app.use("/caricamenti",express.static(path.join(__dirname,"/../upload")));
        //serve client routes
        app.use("/*", function (req, res) {
            res.sendFile(path.join(__dirname, "/../client/index.html"));
        });
    }

}

function setErrorHandlers() {
    //cathc 404 and forward to herror handler
    app.use((req: express.Request, res: express.Response, next) => {
        const err = new Error("Not Found");
        next(err);
    });

    //production herror handler
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {

        res.status(err.status || 500);
        res.json({
            error: {},
            message: err.message,
        });
    });
}

function addSession() {
    let repo = db.connection.getRepository(Session);
    app.use(session(
        {
            secret: keys.session.secret,
            resave: true,
            saveUninitialized: false,
            cookie: keys.session.cookie,
            store: new TypeormStore({ repository: repo })
        }
    ));

    app.use(passport.initialize());
    app.use(passport.session());
}

function setPort() {
    app.set("port", PORT);
}

function normalizePort(val): boolean | number {

    const normalizedPort = parseInt(val, 10);

    if (isNaN(normalizedPort)) {
        // named pipe
        return val;
    }

    if (normalizedPort >= 0) {
        // port number
        return normalizedPort;
    }

    return false;
}


function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    const bind = typeof PORT === "string"
        ? "Pipe " + PORT
        : "Port " + PORT;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            // tslint:disable-next-line
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            // tslint:disable-next-line
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server 'listening' event.
 */

function onListening() {
    const addr = server.address();
    const bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr.port;
}