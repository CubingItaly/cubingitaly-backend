import { getCustomRepository } from "typeorm";
import { sendError } from "../../shared/error.utils";
import { Router } from "express";
//# we need this because otherwise passport doesn't work
import * as passport from "passport";
import { getUser, verifyLogin } from "../../shared/login.utils";
import { sanitize } from "./sanitizer";
import { Deserialize } from "cerialize";
import { CompetitionRepository } from '../../db/repository/competition.repository';
import { RegistrationRepository } from '../../db/repository/competition/registration.repository';
import { CompetitionEntity } from "../../db/entity/competition.entity";
import { CompetitionModel } from "../../models/classes/competition.model";
import { UserModel } from "../../models/classes/user.model";
import { EventRepository } from "../../db/repository/competition/event.repository";
import { EventEntity } from "../../db/entity/competition/event.entity";
import { EventModel } from "../../models/classes/competition/event.model";
import { UserRepository } from "../../db/repository/user.repository";
import { RegistrationEntity } from "../../db/entity/competition/registration.entity";
import { RegistrationModel } from "../../models/classes/competition/registration.model";
import { TravelMeanRepository } from "../../db/repository/competition/travelmean.repository";
import { TravelMeanEntity } from "../../db/entity/competition/travelmean.entity";
import { TravelMeanModel } from "../../models/classes/competition/travelmean.model";
import { PaymentMeanRepository } from "../../db/repository/competition/paymentmean.repository";
import { PaymentMeanEntity } from "../../db/entity/competition/paymentmean.entity";
import { PaymentMeanModel } from "../../models/classes/competition/paymentmean.model";
import { DirectionsEntity } from "../../db/entity/competition/directions.entity";
import { DirectionsRepository } from "../../db/repository/competition/directions.repository";
import { DirectionsModel } from "../../models/classes/competition/directions.model";

const router: Router = Router();

const attributes: string[] = ["id", "name", "startDate", "endDate", "country", "city", "address", "location", "contactName", "contactEmail"];

function getCompetitionRepository(): CompetitionRepository {
    return getCustomRepository(CompetitionRepository);
}

function getRegistrationRepository(): RegistrationRepository {
    return getCustomRepository(RegistrationRepository);
}

function getDirectionsRepository(): DirectionsRepository {
    return getCustomRepository(DirectionsRepository);
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
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
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
        sendError(res, 404, "Bad request. The requested resource doesn't exist.");
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

router.get("/:id", async (req, res) => {
    let repo: CompetitionRepository = getCompetitionRepository();
    let entity: CompetitionEntity = await repo.getCompetition(req.params.id);
    let user: UserModel = getUser(req);
    if (entity && entity.isOfficial || (user && user.canViewCompetition(entity._transform()))) {
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

function registrationIsInTheRequest(req, res, next) {
    let registration: RegistrationModel = Deserialize(req.body.registration, RegistrationModel);
    if (registration && registration.id) {
        next();
    } else {
        sendError(res, 400, "Bad request. The request is malformed.")
    }
}

router.get("/:id/registrations", async (req, res) => {
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    let user: UserModel = getUser(req);
    if (competition && (competition.isOfficial || user && user.canEditCompetition(competition._transform()))) {
        let registration: RegistrationEntity = await getRegistrationRepository().getRegistrationByCompetition(competition);
        res.status(200).json(registration._transform());
    } else {
        sendError(res, 404, "Bad request. The requested resource doesn't exist.");
    }
});

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

router.put("/:id/registrations", verifyLogin, canEditCompetition, registrationIsInTheRequest, allParametersAreOk, async (req, res) => {
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    if (competition) {
        let repo: RegistrationRepository = getRegistrationRepository();
        let oldReg = await repo.getRegistrationByCompetition(competition);
        let registration: RegistrationModel = Deserialize(req.body.registration, RegistrationModel);
        if (oldReg && oldReg.id === registration.id) {
            let entity: RegistrationEntity = new RegistrationEntity();
            entity._assimilate(registration);
            try {
                entity = await repo.updateRegistration(entity);
                res.status(200).json(entity._transform());
            } catch (e) {
                sendError(res, 400, "Bad request. The request is malformed and some parameters are missing.");
            }

        } else {
            sendError(res, 404, "Bad request. The requested resource doesn't exist.");
        }
    } else {
        sendError(res, 404, "Bad request. The requested resource doesn't exist.");
    }
});


router.get("/:id/directions", async (req, res) => {
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    let user = getUser(req);
    if (competition && (competition.isOfficial || (user && user.canEditCompetition(competition._transform())))) {
        let directions: DirectionsEntity[] = await getDirectionsRepository().getDirections(competition);
        let model: DirectionsModel[] = directions.map((d: DirectionsEntity) => d._transform());
        res.status(200).json(model);
    } else {
        sendError(res, 404, "Bad request. The requested resource doesn't exist.");
    }
});

function directionsHasNoId(req, res, next) {
    let directions: DirectionsModel = Deserialize(req.body.directions, DirectionsModel);
    if (directions && !directions.id) {
        next();
    } else {
        sendError(res, 400, "1 Bad request. The request is malformed and some parameters are missing.");
    }
}

router.post("/:id/directions", verifyLogin, canEditCompetition, directionsHasNoId, async (req, res) => {
    let directions: DirectionsModel = Deserialize(req.body.directions, DirectionsModel);
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    if (competition) {
        let entity: DirectionsEntity = new DirectionsEntity();
        entity._assimilate(directions);
        try {
            entity = await getDirectionsRepository().createDirection(entity, competition);
            res.status(200).json(entity._transform());
        } catch (e) {
            sendError(res, 400, "2 Bad request. The request is malformed and some parameters are missing.");
        }
    } else {
        sendError(res, 404, "3 Bad request. The requested resource doesn't exist.");
    }
});

function directionsIdMatch(req, res, next) {
    let directions: DirectionsModel = Deserialize(req.body.directions, DirectionsModel);
    if (directions && directions.id === Number(req.params.did)) {
        next();
    } else {
        sendError(res, 400, "Bad request. 1 The request is malformed and some parameters are missing.");
    }
}

router.put("/:id/directions/:did", verifyLogin, canEditCompetition, directionsIdMatch, async (req, res) => {
    let directions: DirectionsModel = Deserialize(req.body.directions, DirectionsModel);
    let repo: DirectionsRepository = getDirectionsRepository();
    let old: DirectionsEntity = await repo.getDirection(req.params.did);
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    if (competition && old) {
        let entity: DirectionsEntity = new DirectionsEntity();
        entity._assimilate(directions);
        try {
            entity = await repo.updateDirection(entity);
            res.status(200).json(entity._transform());
        } catch (e) {
            sendError(res, 400, "2 Bad request. The request is malformed and some parameters are missing.");
        }
    } else {
        sendError(res, 404, "3 Bad request. The requested resource doesn't exist.");
    }
});

router.delete("/:id/directions/:did", verifyLogin, canEditCompetition, async (req, res) => {
    let repo: DirectionsRepository = getDirectionsRepository();
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    if (competition) {
        let directions: DirectionsEntity[] = await repo.getDirectionsByCompetition(competition);
        if (directions.findIndex((d: DirectionsEntity) => d.id === req.params.did)) {
            await repo.deleteDirection(req.params.did);
            res.status(200).send({});
        } else {
            sendError(res, 404, "Bad request. The requested resource doesn't exist.");
        }
    } else {
        sendError(res, 404, "Bad request. The requested resource doesn't exist.");
    }
});



export { router }