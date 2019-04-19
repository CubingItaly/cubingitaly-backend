import { getCustomRepository } from "typeorm";
import { sendError } from "../../shared/error.utils";
import { Router } from "express";
//# we need this because otherwise passport doesn't work
import * as passport from "passport";
import { canViewCompetition, getCompetitionRepository, canCreateCompetition, canEditCompetition, canAnnounceCompetition, getRegistrationRepository, getDirectionsRepository, getScheduleRepository, canAdminCompetitions } from '../../shared/competition.utils';
import { CompetitionEntity } from "../../db/entity/competition.entity";
import { verifyLogin, getUser } from "../../shared/login.utils";
import { CompetitionModel } from "../../models/classes/competition.model";
import { Deserialize } from "cerialize";
import { UserModel } from "../../models/classes/user.model";
import { EventModel } from "../../models/classes/competition/event.model";
import { UserRepository } from "../../db/repository/user.repository";
import { EventRepository } from "../../db/repository/competition/event.repository";
import { sanitize } from "./sanitizer";
import { EventEntity } from "../../db/entity/competition/event.entity";
import { TravelMeanRepository } from "../../db/repository/competition/travelmean.repository";
import { TravelMeanEntity } from "../../db/entity/competition/travelmean.entity";
import { TravelMeanModel } from "../../models/classes/competition/travelmean.model";
import { PaymentMeanRepository } from "../../db/repository/competition/paymentmean.repository";
import { PaymentMeanEntity } from "../../db/entity/competition/paymentmean.entity";
import { PaymentMeanModel } from "../../models/classes/competition/paymentmean.model";
import { RegistrationEntity } from "../../db/entity/competition/registration.entity";
import { RegistrationModel } from "../../models/classes/competition/registration.model";
import { DirectionsEntity } from "../../db/entity/competition/directions.entity";
import { DirectionsModel } from "../../models/classes/competition/directions.model";
import { ScheduleEntity } from "../../db/entity/competition/schedule.entity";
import { ScheduleModel } from "../../models/classes/competition/schedule.model";
import { UserEntity } from "../../db/entity/user.entity";

const router: Router = Router();

const requiredAttributes: string[] = ["id", "name", "startDate", "endDate", "country", "city", "address", "location", "contactName", "contactEmail"];

function requiredParametersArePresent(req, res, next) {
    let competition: CompetitionModel = Deserialize(req.body.competition, CompetitionModel);
    let ok: boolean = true;
    for (let a of requiredAttributes) {
        if (!competition[a]) {
            ok = false;
            break;
        }
    }
    //Check if the end date is valid and greater or equal than the start date
    if (competition.startDate.getTime() > competition.endDate.getTime()) {
        ok = false;
    }
    if (ok) {
        next();
    } else {
        sendError(res, 400, "Bad request. Some attributes are missing.");
    }
}

async function isIdNew(req, res, next) {
    req.body.competition.id = req.body.competition.id.replace(/\s/g, '');
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.body.competition.id);
    if (!competition) {
        next();
    } else {
        sendError(res, 400, "Bad request. A competition with the given Id already exists.");
    }
}

async function idsMatch(req, res, next) {
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.body.competition.id);
    if (competition.id === req.params.id) {
        next();
    } else {
        sendError(res, 400, "Bad request. A competition with the given id doesn't exists.");
    }
}

async function edoAreValid(req, res, next) {
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
                    let comp: CompetitionEntity = await getCompetitionRepository().getCompetition(req.body.competition.id);
                    if (comp && !comp.delegates.find((del: UserEntity) => del.id === u.id)) {
                        ok = false;
                    }
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

async function sanitizeComp(req, res, next) {
    req.body.competition.extraInformation = req.body.competition.extraInformation ? sanitize(req.body.competition.extraInformation) : null;
    req.body.competition.locationURL = req.body.competition.locationURL ? sanitize(req.body.competition.locationURL) : null;
    req.body.competition.logoURL = req.body.competition.logoURL ? sanitize(req.body.competition.logoURL) : null;
    next();
}

router.get("/events", async (req, res) => {
    let eventsRepo: EventRepository = getCustomRepository(EventRepository);
    let events: EventEntity[] = await eventsRepo.getEvents();
    let model: EventModel[] = events.map((e: EventEntity) => e._transform());
    res.status(200).json(model);
});

router.get("/travelmeans", async (req, res) => {
    let meanRepo: TravelMeanRepository = getCustomRepository(TravelMeanRepository);
    let means: TravelMeanEntity[] = await meanRepo.getTravelMeans();
    let model: TravelMeanModel[] = means.map((m: TravelMeanEntity) => m._transform());
    res.status(200).json(model);
});

router.get("/paymentmeans", async (req, res) => {
    let meanRepo: PaymentMeanRepository = getCustomRepository(PaymentMeanRepository);
    let means: PaymentMeanEntity[] = await meanRepo.getPaymentMeans();
    let model: PaymentMeanModel[] = means.map((m: PaymentMeanEntity) => m._transform());
    res.status(200).json(model);
});

/*
Competition APIs
*/


router.get("/mine", verifyLogin, async (req, res) => {
    let me: UserModel = getUser(req);
    let entityMe: UserEntity = new UserEntity();
    entityMe._assimilate(me);
    let competitions: CompetitionEntity[] = await getCompetitionRepository().getMyCompetitions(entityMe);
    let model: CompetitionModel[] = competitions.map((c: CompetitionEntity) => c._transform());
    res.status(200).json(model);
});

router.get("/all", verifyLogin, canAdminCompetitions, async (req, res) => {
    let me: UserModel = getUser(req);
    let competitions: CompetitionEntity[] = await getCompetitionRepository().getAdminCompetitions();
    let model: CompetitionModel[] = competitions.map((c: CompetitionEntity) => c._transform());
    res.status(200).json(model);
});

router.get("/official", async (req, res) => {
    let competitions: CompetitionEntity[] = await getCompetitionRepository().getOfficialCompetitions();
    let model: CompetitionModel[] = competitions.map((c: CompetitionEntity) => c._transform());
    res.status(200).json(model);
});

router.get("/upcoming", async (req, res) => {
    let date: Date = req.query.date ? new Date(req.query.date) : new Date(new Date().toLocaleDateString("it-it", { timeZone: "Europe/Rome", day: "2-digit", month: "2-digit", year: "numeric" }));
    let competitions: CompetitionEntity[] = await getCompetitionRepository().getUpcomingCompetitions(date);
    let model: CompetitionModel[] = competitions.map((c: CompetitionEntity) => c._transform());
    res.status(200).json(model);
});

router.get("/ongoing", async (req, res) => {
    let date: Date = req.query.date ? new Date(req.query.date) : new Date(new Date().toLocaleDateString("it-it", { timeZone: "Europe/Rome", day: "2-digit", month: "2-digit", year: "numeric" }));
    let competitions: CompetitionEntity[] = await getCompetitionRepository().getOnGoingCompetitions(date);
    let model: CompetitionModel[] = competitions.map((c: CompetitionEntity) => c._transform());
    res.status(200).json(model);
});

router.get("/past", async (req, res) => {
    let date: Date = req.query.date ? new Date(req.query.date) : new Date(new Date().toLocaleDateString("it-it", { timeZone: "Europe/Rome", day: "2-digit", month: "2-digit", year: "numeric" }));
    let competitions: CompetitionEntity[] = await getCompetitionRepository().getPastCompetitions(date);
    let model: CompetitionModel[] = competitions.map((c: CompetitionEntity) => c._transform());
    res.status(200).json(model);
});


router.get("/:id", canViewCompetition, async (req, res) => {
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    res.status(200).json(competition._transform());
});

router.get("/:id/exists", verifyLogin, canCreateCompetition, async (req, res) => {
    let competition: boolean = await getCompetitionRepository().getIfCompetitionExist(req.params.id);
    res.json({ "exists": competition });
});

router.post("/", verifyLogin, canCreateCompetition,
    isIdNew, requiredParametersArePresent, edoAreValid, sanitizeComp, async (req, res) => {
        let competition: CompetitionModel = Deserialize(req.body.competition, CompetitionModel);
        let entity: CompetitionEntity = new CompetitionEntity();
        entity._assimilate(competition);
        try {
            entity = await getCompetitionRepository().createCompetition(entity);
            res.status(200).json(entity._transform());
        } catch (e) {
            sendError(res, 400, "Bad request. Some attributes are missing.");
        }
    });

router.put("/:id", verifyLogin, canEditCompetition,
    idsMatch, requiredParametersArePresent, edoAreValid, sanitizeComp, async (req, res) => {
        let competition: CompetitionModel = Deserialize(req.body.competition, CompetitionModel);
        let entity: CompetitionEntity = new CompetitionEntity();
        entity._assimilate(competition);
        try {
            entity = await getCompetitionRepository().editorUpdateCompetition(entity);
            res.status(200).json(entity._transform());
        } catch (e) {
            sendError(res, 400, "Bad request. Some attributes are missing.");
        }
    });

router.put("/:id/announce", verifyLogin, canAnnounceCompetition,
    idsMatch, requiredParametersArePresent, edoAreValid, sanitizeComp, async (req, res) => {
        let competition: CompetitionModel = Deserialize(req.body.competition, CompetitionModel);
        let entity: CompetitionEntity = new CompetitionEntity();
        entity._assimilate(competition);
        try {
            entity = await getCompetitionRepository().announcerUpdateCompetition(entity);
            res.status(200).json(entity._transform());
        } catch (e) {
            sendError(res, 400, "Bad request. Some attributes are missing.");
        }
    });

router.delete("/:id", verifyLogin, canCreateCompetition, async (req, res) => {
    let id: string = req.params.id;
    await getCompetitionRepository().deleteCompetition(id);
    res.status(200).json({});
});


/*
Registration APIs
*/

async function allParametersAreOk(req, res, next) {
    let r: RegistrationModel = Deserialize(req.body.registration, RegistrationModel);
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    let ok = true && r.competitorsLimit >= 20;
    ok = ok && (r.registrationOpen.getTime() <= r.registrationClose.getTime());
    ok = ok && r.registrationClose.getTime() <= competition._transform().startDate.getTime();
    ok = ok && (!r.isRegistrationPaid || (r.isRegistrationPaid && r.registrationFee > 0));
    ok = ok && ((!r.isRegistrationPaid || (r.isRegistrationPaid
        && (!r.newcomerDiscount || (r.newcomerDiscount && r.newcomerFee > 0)))));
    ok = ok && (!r.registrationAtTheVenue || (r.registrationAtTheVenue && r.atTheVenueFee > 0));
    ok = ok && (!r.guestsPay || (r.guestsPay && r.guestsFee > 0));
    ok = ok && (!r.isRegistrationPaid || (r.isRegistrationPaid &&
        (r.paymentMeans.findIndex((p: PaymentMeanModel) => p.id === "paypal") >= 0 || r.paymentMeans.findIndex((p: PaymentMeanModel) => p.id === "cc") >= 0 || r.paymentMeans.findIndex((p: PaymentMeanModel) => p.id === "cash") >= 0)));
    ok = ok && (!r.isRegistrationPaid || (r.isRegistrationPaid
        && (!r.paymentMeans.find((p: PaymentMeanModel) => p.id === "paypal")
            || (r.paymentMeans.find((p: PaymentMeanModel) => p.id === "paypal") && r.paypalLink.length > 0))));
    ok = ok && (!r.isRegistrationPaid || (r.isRegistrationPaid && (!((r.paymentMeans.find((p: PaymentMeanModel) => p.id === "paypal"))
        || r.paymentMeans.find((p: PaymentMeanModel) => p.id === "cc"))
        || (((r.paymentMeans.find((p: PaymentMeanModel) => p.id === "paypal")) || r.paymentMeans.find((p: PaymentMeanModel) => p.id === "cc"))
            && (!r.refundAvailable || (r.refundAvailable && r.refundPolicy.length > 0))))));
    if (ok) {
        next();
    } else {
        sendError(res, 400, "Bad request. The request is malformed and some parameters doesn't respect the requirements");
    }
}

async function regBelongsToComp(req, res, next) {
    let comp: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    let registration: RegistrationEntity = await getRegistrationRepository().getRegistrationByCompetition(comp);
    if (registration && registration.id === req.body.registration.id) {
        next();
    } else {
        sendError(res, 400, "Bad request. The registration doesn't belong to the competition.");
    }
}

async function sanitizeRegistration(req, res, next) {
    req.body.registration.registrationExtraInfo = req.body.registration.registrationExtraInfo ? sanitize(req.body.registration.registrationExtraInfo) : null;
    next();
}

router.get("/:id/registrations", canViewCompetition, async (req, res) => {
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    let registration: RegistrationEntity = await getRegistrationRepository().getRegistrationByCompetition(competition);
    res.status(200).json(registration._transform());
});

router.put("/:id/registrations", verifyLogin, canEditCompetition, regBelongsToComp, allParametersAreOk, sanitizeRegistration, async (req, res) => {
    let registration: RegistrationModel = Deserialize(req.body.registration, RegistrationModel);
    let entity: RegistrationEntity = new RegistrationEntity();
    entity._assimilate(registration);
    try {
        entity = await getRegistrationRepository().updateRegistration(entity);
        res.status(200).json(entity._transform());
    } catch (e) {
        sendError(res, 400, "Bad request. Some attributes are missing.");
    }
});

/*
Directions APIs
*/
function directionsHasNoId(req, res, next) {
    let directions: DirectionsModel = Deserialize(req.body.directions, DirectionsModel);
    if (directions && !directions.id) {
        next();
    } else {
        sendError(res, 400, "Bad request. The request is malformed and some parameters are missing.");
    }
}

function sanitizeDirections(req, res, next) {
    req.body.directions.directions = req.body.directions.directions ? sanitize(req.body.directions.directions) : null;
    next();
}

async function eventsExist(req, res, next) {
    let directions: DirectionsModel = Deserialize(req.body.directions, DirectionsModel);
    let travelMean: TravelMeanEntity = await getCustomRepository(TravelMeanRepository).getTravelMean(directions.id);
    if (travelMean) {
        next();
    } else {
        sendError(res, 400, "Bad request. Some attributes are missing.");
    }
}

async function didMatch(req, res, next) {
    let directions: DirectionsEntity = await getDirectionsRepository().getDirection(req.params.did);
    if (directions && directions.id === req.body.directions.id) {
        next();
    } else {
        sendError(res, 400, "Bad request. Directions IDs do not match.");
    }
}

async function dirBelongsToComp(req, res, next) {
    let directions: DirectionsEntity[] = await getDirectionsRepository().getDirectionsByCompetition(req.params.id);
    if (directions.findIndex((d: DirectionsEntity) => d.id === req.params.did)) {
        next();
    } else {
        sendError(res, 400, "Bad request. The direction doesn't exist.");
    }
}

router.get("/:id/directions", canViewCompetition, async (req, res) => {
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    let directions: DirectionsEntity[] = await getDirectionsRepository().getDirectionsByCompetition(competition);
    let model: DirectionsModel[] = directions.map((d: DirectionsEntity) => d._transform());
    res.status(200).json(model);
});

router.post("/:id/directions", verifyLogin, canEditCompetition, directionsHasNoId,
    sanitizeDirections, eventsExist, async (req, res) => {
        let directions: DirectionsModel = Deserialize(req.body.directions, DirectionsModel);
        let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
        let entity: DirectionsEntity = new DirectionsEntity();
        entity._assimilate(directions);
        try {
            entity = await getDirectionsRepository().createDirection(entity, competition);
            res.status(200).json(entity._transform());
        } catch (e) {
            sendError(res, 400, "Bad request. Some attributes are missing.");
        }
    });

router.put("/:id/directions/:did", verifyLogin, canEditCompetition, didMatch,
    dirBelongsToComp, sanitizeDirections, eventsExist, async (req, res) => {
        let directions: DirectionsModel = Deserialize(req.body.directions, DirectionsModel);
        let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
        let entity: DirectionsEntity = new DirectionsEntity();
        entity._assimilate(directions);
        try {
            entity = await getDirectionsRepository().createDirection(entity, competition);
            res.status(200).json(entity._transform());
        } catch (e) {
            sendError(res, 400, "Bad request. Some attributes are missing.");
        }
    });

router.delete("/:id/directions/:did", verifyLogin, canEditCompetition, dirBelongsToComp, async (req, res) => {
    await getDirectionsRepository().deleteDirection(req.params.did);
    res.status(200).send({});
});

/*
Schedule APIs
*/

router.get("/:id/schedule", canViewCompetition, async (req, res) => {
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    let schedule: ScheduleEntity[] = await getScheduleRepository().getSchedule(competition);
    let model: ScheduleModel[] = schedule.map((s: ScheduleEntity) => s._transform());
    res.status(200).json(model);
});

export { router }