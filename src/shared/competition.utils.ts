import { getUser } from "./login.utils";
import { sendError } from './error.utils';
import { CompetitionRepository } from '../db/repository/competition.repository';
import { RegistrationRepository } from '../db/repository/competition/registration.repository';
import { DirectionsRepository } from '../db/repository/competition/directions.repository';
import { ScheduleRepository } from '../db/repository/competition/schedule.repository';
import { getCustomRepository } from "typeorm";
import { UserModel } from "../models/classes/user.model";
import { CompetitionEntity } from "../db/entity/competition.entity";
import { CompetitionModel } from "../models/classes/competition.model";
import { ExtraTabRepository } from "../db/repository/competition/extratab.repository";


export function getCompetitionRepository(): CompetitionRepository {
    return getCustomRepository(CompetitionRepository);
}

export function getRegistrationRepository(): RegistrationRepository {
    return getCustomRepository(RegistrationRepository);
}

export function getDirectionsRepository(): DirectionsRepository {
    return getCustomRepository(DirectionsRepository);
}

export function getScheduleRepository(): ScheduleRepository {
    return getCustomRepository(ScheduleRepository);
}

export function getExtraTabRepository(): ExtraTabRepository {
    return getCustomRepository(ExtraTabRepository);
}

export async function canViewCompetition(req, res, next) {
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    let user: UserModel = getUser(req);
    if (competition) {
        if (competition.isOfficial || (user && user.canViewCompetition(competition._transform()))) {
            next();
        } else {
            sendError(res, 404, "Error! The requested resource doesn't exist.");
        }
    } else {
        sendError(res, 404, "Error! The requested resource doesn't exist.");
    }
}

export function canCreateCompetition(req, res, next) {
    let user: UserModel = getUser(req);
    if (user.canCreateCompetitions()) {
        next();
    } else {
        sendError(res, 403, "Error! You don't have enough permissions to perform the requested action.");
    }
}

export async function canEditCompetition(req, res, next) {
    let user: UserModel = getUser(req);
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    if (competition && user.canEditCompetition(competition._transform())) {
        next();
    } else {
        sendError(res, 403, "Error! You don't have enough permissions to perform the requested action.");
    }
}

export async function canAnnounceCompetition(req, res, next) {
    let user: UserModel = getUser(req);
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    if (competition && user.canAnnounceCompetition(competition._transform())) {
        next();
    } else {
        sendError(res, 403, "Error! You don't have enough permissions to perform the requested action.");
    }
}

export async function canAdminCompetitions(req, res, next) {
    let user: UserModel = getUser(req);
    if (user.canAdminCompetitions()) {
        next();
    } else {
        sendError(res, 403, "Error! You don't have enough permissions to perform the requested action.");
    }
}