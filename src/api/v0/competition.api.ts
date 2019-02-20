import { getCustomRepository } from "typeorm";
import { sendError } from "../../shared/error.utils";
import { Router } from "express";
//# we need this because otherwise passport doesn't work
import * as passport from "passport";
import { getUser, verifyLogin } from "../../shared/login.utils";
import { sanitize } from "./sanitizer";
import { Deserialize } from "cerialize";
import { CompetitionRepository } from '../../db/repository/competition.repository';
import { CompetitionEntity } from "../../db/entity/competition.entity";
import { CompetitionModel } from "../../models/classes/competition.model";
import { UserModel } from "../../models/classes/user.model";
import { EventRepository } from "../../db/repository/competition/event.repository";
import { EventEntity } from "../../db/entity/competition/event.entity";
import { EventModel } from "../../models/classes/competition/event.model";
import { UserRepository } from "../../db/repository/user.repository";

const router: Router = Router();

const attributes: string[] = ["id", "name", "startDate", "endDate", "country", "city", "address", "location", "contactName", "contactEmail"];

function getCompetitionRepository(): CompetitionRepository {
    return getCustomRepository(CompetitionRepository);
}

function canCreateCompetitions(req, res, next) {
    let user: UserModel = getUser(req);
    if (user.canCreateCompetitions()) {
        next();
    } else {
        sendError(res, 403, "Permission denied. You don't the permissions to perform the requested action.");
    }
}

function attributesArePresent(req, res, next) {
    let competition: CompetitionModel = Deserialize(req.body.competition, CompetitionModel);
    let missing: boolean = false;
    for (let attribute of attributes) {
        if (!competition[attribute]) {
            missing = true;
        }
    }
    if (missing) {
        sendError(res, 400, "Some competition attributes are missing.");
    } else {
        next();
    }
}

async function idAlreadyExist(req, res, next) {
    let exist: boolean = await getCompetitionRepository().getIfCompetitionExist(req.body.competition.id);
    if (exist) {
        sendError(res, 409, "Error. The provided ID already exists.");
    } else {
        next();
    }
}

async function canEditCompetition(req, res, next) {
    let user: UserModel = getUser(req);
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.body.competition.id);
    if (user.canEditCompetition(competition._transform())) {
        next();
    } else {
        sendError(res, 403, "Permission denied. You don't the permissions to perform the requested action.");
    }
}

async function canAnnounceCompetition(req, res, next) {
    let user: UserModel = getUser(req);
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.body.competition.id);
    if (user.canAnnounceCompetition(competition._transform())) {
        next();
    } else {
        sendError(res, 403, "Permission denied. You don't the permissions to perform the requested action.");
    }
}

async function idExists(req, res, next) {
    let paramId: string = req.params.id;
    let id: string = req.body.competition.id;
    let exist: boolean = await getCompetitionRepository().getIfCompetitionExist(id);
    if (paramId === id && exist) {
        next();
    } else {
        sendError(res, 404, "Bad request. The request is malformed.");
    }
}

function endDateBeforeStart(req, res, next) {
    let start: Date = Deserialize(req.body.competition.startDate, Date);
    let end: Date = Deserialize(req.body.competition.endDate, Date);
    if (start.getTime() > end.getTime()) {
        sendError(res, 400, "Bad request. The start date cannot be greater than the end date.");
    } else {
        next();
    }
}

async function requestHasEDO(req, res, next) {
    let organizers: UserModel[] = Deserialize(req.body.competition.organizers, UserModel);
    let delegates: UserModel[] = Deserialize(req.body.competition.delegates, UserModel);
    let events: EventModel[] = Deserialize(req.body.competition.events, EventModel);
    if (organizers && delegates && events && organizers.length > 0 && delegates.length > 0 && events.length > 0) {
        let ok: boolean = true;
        let userRepo: UserRepository = getCustomRepository(UserRepository);
        for (let u of organizers) {
            let exists: boolean = await userRepo.checkIfUserExists(u.id);
            if (!exists) {
                ok = false;
            }
            break;
        }
        if (ok) {
            for (let u of delegates) {
                let isDelegate: boolean = await userRepo.checkIfIsDelegate(u.id);
                if (!isDelegate) {
                    ok = false;
                }
                break;
            }
        }
        if (ok) {
            let eventRepo: EventRepository = getCustomRepository(EventRepository);
            for (let e of events) {
                let exists: boolean = await eventRepo.getIfEventExists(e.id);
                if (!exists) {
                    ok = false;
                    break;
                }
            }
        }
        if (ok) {
            next();
        } else {
            sendError(res, 400, "Bad request. You need organizers, delegates and events.");
        }
    } else {
        sendError(res, 400, "Bad request. You need organizers, delegates and events.");
    }

}

router.get("/events", async (req, res) => {
    let eventsRepo: EventRepository = getCustomRepository(EventRepository);
    let events: EventEntity[] = await eventsRepo.getEvents();
    let model: EventModel[] = events.map((e: EventEntity) => e._transform());
    res.status(200).json(model);
});

router.get("/:id", async (req, res) => {
    let repo: CompetitionRepository = getCompetitionRepository();
    let entity: CompetitionEntity = await repo.getCompetition(req.params.id);
    let user: UserModel = getUser(req);
    if (entity.isOfficial || (user && user.canViewCompetition(entity._transform()))) {
        res.status(200).json(entity._transform());
    } else {
        sendError(res, 404, "The requested resource does not exist.");
    }
});

router.post("/", verifyLogin, canCreateCompetitions, idAlreadyExist, attributesArePresent, endDateBeforeStart, requestHasEDO, async (req, res) => {
    let comp: CompetitionModel = Deserialize(req.body.competition, CompetitionModel);
    let entity: CompetitionEntity = new CompetitionEntity();
    entity._assimilate(comp);
    try {
        if (entity.events && entity.organizers && entity.delegates) {
            entity = await getCompetitionRepository().createCompetition(entity);
            if (entity) {
                res.status(200).json(entity._transform());
            } else {
                sendError(res, 400, "Bad request. The request is malformed and some parameters are missing.");
            }
        } else {
            throw new Error("missing parameters");
        }
    } catch (e) {
        sendError(res, 400, "Bad request. The request is malformed and some parameters are missing.");
    }
});

router.put("/:id", verifyLogin, canEditCompetition, idExists, attributesArePresent, endDateBeforeStart, requestHasEDO, async (req, res) => {
    let competition: CompetitionModel = Deserialize(req.body.competition, CompetitionModel);
    let entity: CompetitionEntity = new CompetitionEntity();
    entity._assimilate(competition);
    try {
        entity = await getCompetitionRepository().editorUpdateCompetition(entity);
        if (entity) {
            res.status(200).json(entity._transform());
        } else {
            sendError(res, 400, "Bad request. The request is malformed and some parameters are missing.");
        }
    } catch (e) {
        sendError(res, 400, "Bad request. The request is malformed and some parameters are missing.");
    }
});

router.put("/:id/announce", verifyLogin, canAnnounceCompetition, idExists, attributesArePresent, endDateBeforeStart, requestHasEDO, async (req, res) => {
    let competition: CompetitionModel = Deserialize(req.body.competition, CompetitionModel);
    let entity: CompetitionEntity = new CompetitionEntity();
    entity._assimilate(competition);
    let old: CompetitionEntity = await getCompetitionRepository().getCompetition(competition.id);
    if (!old.isOfficial && competition.isOfficial) {
        //check that directions, schedule and registration are ok
    }
    try {
        entity = await getCompetitionRepository().announcerUpdateCompetition(entity);
        if (entity) {
            res.status(200).json(entity._transform());
        } else {
            sendError(res, 400, "Bad request. The request is malformed and some parameters are missing.");
        }
    } catch (e) {
        sendError(res, 400, "Bad request. The request is malformed and some parameters are missing.");
    }
});

router.delete("/:id", verifyLogin, canCreateCompetitions, idExists, async (req, res) => {
    let id: string = req.params.id;
    await getCompetitionRepository().deleteCompetition(id);
    res.status(200).json({});
});

export { router }