import * as express from 'express';
import { json, urlencoded } from 'body-parser';
import * as compression from 'compression';
import * as expressSanitizer from 'express-sanitizer';
import * as path from 'path';
import * as helmet from 'helmet';

//Routes files
import { router as authRoutes } from './api/v0/auth.api';
import { router as articleRoutes } from './api/v0/article.api';
import { router as teamRoutes } from './api/v0/team.api';
import { router as userRoutes } from './api/v0/user.api';
import { router as categoryRoutes } from './api/v0/category.api';
import { router as pageRoutes } from './api/v0/page.api';
import { router as tutorialRoutes } from './api/v0/tutorial.api';
import { router as contactRoutes } from './api/v0/contact.api';



const app = express();

app.use(helmet());
app.use(json());
app.use(compression());
app.use(urlencoded({ extended: true }));
app.use(expressSanitizer());

app.use("/api/v0/auth", authRoutes);
app.use("/api/v0/teams", teamRoutes);
app.use("/api/v0/users", userRoutes);
app.use("/api/v0/articles", articleRoutes);
app.use("/api/v0/categories", categoryRoutes);
app.use("/api/v0/pages", pageRoutes);
app.use("/api/v0/tutorial", tutorialRoutes);
app.use("/api/v0/contact", contactRoutes);

if (process.env.NODE_ENV === "production") {
    //serve static files from client folder
    app.use(express.static(path.join(__dirname, "/../client")));
    //serve client routes
    app.use("/*", function (req, res) {
        res.sendFile(path.join(__dirname, "/../client/index.html"));
    });
}

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


export { app };