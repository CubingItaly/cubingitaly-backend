#!/usr/bin/env node

import * as http from "http";
import { Database } from './db/database';
import { app } from './app';
import { Session } from "./db/entity/session.entity";
import * as session from 'express-session';
import { keys } from './secrets/keys';
import { TypeormStore } from "typeorm-store";

const PORT = normalizePort(process.env.PORT || 4300);
const db: Database = new Database();
let server;

db.createConnection()
    .then(() => db.initDatabase())
    .then(() => console.log("Connection to DB created"))
    .then(() => {
        addSession();
        setPort();
        server = http.createServer(app);
        server.listen(PORT);
        server.on("error", onError);
        server.on("listening", onListening);
    });


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