import { Router } from "express";
import * as passport from 'passport';
import { scheduleMiddleWare } from "../../passport/strategy.passport.wca";
import { verifyLogin, getUser } from "../../shared/login.utils";
import { sendError } from "../../shared/error.utils";
import { UserModel } from "../../models/classes/user.model";
import { CompetitionEntity } from "../../db/entity/competition.entity";
import { getCustomRepository, useContainer } from "typeorm";
import { CompetitionRepository } from "../../db/repository/competition.repository";
import { CompetitionModel } from "../../models/classes/competition.model";
import * as request from 'request-promise-native';

import { ScheduleRowModel } from '../../models/classes/competition/schedule.row.model';
import { ScheduleModel } from '../../models/classes/competition/schedule.model';
import { EventRepository } from "../../db/repository/competition/event.repository";
import { EventEntity } from "../../db/entity/competition/event.entity";
import { ScheduleRepository } from "../../db/repository/competition/schedule.repository";
import { ScheduleEntity } from "../../db/entity/competition/schedule.entity";


const router: Router = Router();

function getScheduleRepository(): ScheduleRepository {
    return getCustomRepository(ScheduleRepository);
}


async function canEditCompetition(req, res, next) {
    let user: UserModel = getUser(req);
    let competition: CompetitionEntity = await getCustomRepository(CompetitionRepository).getCompetition(req.params.id);
    let model: CompetitionModel = competition._transform();
    if (user.canEditCompetition(model)) {
        next();
    } else {
        if (user.canViewCompetition(model)) {
            sendError(res, 403, "Permission denied. You don't the permissions to perform the requested action.");
        } else {
            sendError(res, 404, "Error. The requested resource doesn't exist.");
        }
    }
}

async function competitionExist(req, res, next) {
    let competition: CompetitionEntity = await getCustomRepository(CompetitionRepository).getCompetition(req.params.id);
    if (competition) {
        next();
    } else {
        sendError(res, 404, "Error. The requested resource doesn't exist.");
    }
}


/**
 * Redirect the user to the WCA website to ask for the permissions 
 */
router.get("/:id/wca", verifyLogin, competitionExist, canEditCompetition, scheduleMiddleWare, passport.authenticate('wca', { session: false }));

function backupUser(req, res, next) {
    req.backupUser = req.user;
    next();
}




router.get('/wca/callback', verifyLogin, backupUser, passport.authenticate('wca', { session: false }), async (req, res) => {
    let token = req.user.token;
    let comp = req.user.comp;
    req.user = req['backupUser'];
    let wcif = await request({
        url: `https://staging.worldcubeassociation.org/api/v0/competitions/${comp}/wcif`,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-type': 'application/json'
        },
        json: true
    });
    if (wcif.id) {
        let competition: CompetitionEntity = await getCustomRepository(CompetitionRepository).getCompetition(wcif.id);
        if (competition && getUser(req).canEditCompetition(competition._transform())) {
            let schedule: ScheduleModel[] = await scheduleParser(wcif);
            let schedEntity: ScheduleEntity[] = schedule.map((s: ScheduleModel) => {
                let temp: ScheduleEntity = new ScheduleEntity();
                temp._assimilate(s);
                return temp;
            });
            await getScheduleRepository().insertSchedule(competition, schedEntity);
            res.redirect(`/competizioni/${wcif.id}/edit?tab=2`);
        } else {
            sendError(res, 403, "Permission denied. You don't have the permissions to perform the requested action");
        }
    } else {
        sendError(res, 404, "Error. The requested resource doesn't exist.");
    }
});

const otherNames = {
    'other-registration': "Registrazione",
    'other-lunch': "Pranzo",
    'other-awards': "Premiazioni",
    'other-dinner': "Cena",
    'other-tutorial': "Tutorial e introduzione",
    'other-breakfast': "Colazione",
};

const roundNames4 = {
    1: "Primo turno",
    2: "Secondo turno",
    3: "Semifinale",
    4: "Finale"
}


const roundNames3 = {
    1: "Primo turno",
    2: "Secondo turno",
    3: "Finale"
}


const roundNames2 = {
    1: "Primo turno",
    2: "Finale"
}


const roundNames1 = {
    1: "Finale"
}

async function scheduleParser(wcif): Promise<ScheduleModel[]> {

    let scheduleRows: ScheduleRowModel[] = getRows(wcif.schedule.venues);
    scheduleRows = addRoundInfo(wcif.events, scheduleRows);
    scheduleRows = await giveRoundNames(scheduleRows);
    scheduleRows = sortScheduleRows(scheduleRows);

    let schedule: ScheduleModel[] = getScheduleFromRows(scheduleRows);
    schedule = getScheduleFromRows(scheduleRows);
    return schedule;
}

function getScheduleFromRows(scheduleRows: ScheduleRowModel[]): ScheduleModel[] {
    let schedule: ScheduleModel[] = [];
    for (let r of scheduleRows) {
        let index = schedule.findIndex((s: ScheduleModel) => sameDay(s.day, r.start));
        if (index < 0) {
            let newDay: ScheduleModel = new ScheduleModel();
            newDay.day = r.start;
            newDay.dayIndex = schedule.length + 1;
            newDay.rows = [r];
            schedule.push(newDay);
        } else {
            schedule[index].rows.push(r);
        }
    }
    return schedule;
}

function sortScheduleRows(scheduleRows: ScheduleRowModel[]): ScheduleRowModel[] {
    return scheduleRows.sort((a: ScheduleRowModel, b: ScheduleRowModel) => {
        if (a.start > b.start) {
            return 1;
        } else if (a.start < b.start) {
            return -1;
        }
        return 0;
    });
}

async function giveRoundNames(scheduleRows: ScheduleRowModel[]): Promise<ScheduleRowModel[]> {
    let eventRepo: EventRepository = getCustomRepository(EventRepository);
    let dbEvents: EventEntity[] = await eventRepo.getEvents();
    for (let s of scheduleRows) {
        if (s.eventId !== "other") {
            let name = dbEvents.find((e: EventEntity) => e.id === s.eventId).name;
            let round: string;
            let roundsNumber: number = scheduleRows.filter((e: ScheduleRowModel) => e.eventId === s.eventId).length;
            if (roundsNumber === 4) {
                round = roundNames4[s.roundId];
            } else if (roundsNumber === 3) {
                round = roundNames3[s.roundId];
            } else if (roundsNumber === 2) {
                round = roundNames2[s.roundId];
            } else {
                round = roundNames1[s.roundId];
            }
            if (s.cutoff) {
                round += ` combinat` + (roundsNumber === 1 ? "a" : "o");
            }
            s.name = name;
            s.roundName = round;

            if (s.format === "a") {
                s.roundFormat = "Ao5";
            } else if (s.format === "m") {
                s.roundFormat = "Mo3"
            } else {
                s.roundFormat = "Bo" + s.format;
            }

            if (s.cutoff) {
                s.roundFormat = "Bo" + s.cutoffAttempts + "/" + s.roundFormat;
            }

            if (s.attemptId) {
                s.roundFormat += ` (Tentativo ${s.attemptId})`;
            }
        }
    }

    return scheduleRows;;
}


function addRoundInfo(events, scheduleRows: ScheduleRowModel[]): ScheduleRowModel[] {
    let rowsWithInfo: ScheduleRowModel[] = scheduleRows.filter((s: ScheduleRowModel) => s.eventId === "other");
    for (let e of events) {
        for (let r of e.rounds) {
            let fSched: ScheduleRowModel[] = scheduleRows.filter((s: ScheduleRowModel) => `${s.eventId}-r${s.roundId}` === r.id);
            for (let s of fSched) {
                s.format = r.format;
                if (r.timeLimit) {
                    s.timeLimit = r.timeLimit.centiseconds;
                    s.cumulativeTimeLimit = r.timeLimit.cumulativeRoundIds.length > 0;
                }
                if (r.cutoff) {
                    s.cutoff = r.cutoff.attemptResult;
                    s.cutoffAttempts = r.cutoff.numberOfAttempts;
                }
                if (r.advancementCondition) {
                    s.advancementType = r.advancementCondition.type;
                    s.advancementLevel = r.advancementCondition.level;
                }
                rowsWithInfo.push(s);
            }
        }
    }
    return rowsWithInfo;
}


function getRows(venues): ScheduleRowModel[] {
    let scheduleRows: ScheduleRowModel[] = [];
    for (let v of venues) {
        for (let r of v.rooms) {
            for (let a of r.activities) {
                let row: ScheduleRowModel = new ScheduleRowModel();
                row.start = new Date(a.startTime);
                row.end = new Date(a.endTime);
                if (v.rooms.length > 1) {
                    row.room = r.name;
                }
                if ((a.activityCode).startsWith("other")) {
                    row.eventId = "other";
                    if (a.activityCode === "other-misc") {
                        row.name = a.name;
                    } else {
                        row.name = otherNames[a.activityCode];
                    }

                    let index: number = scheduleRows.findIndex((x: ScheduleRowModel) => (x.eventId === row.eventId && x.roundId === row.roundId && x.attemptId === row.attemptId && x.start === row.start));
                    if (index < 0) {
                        scheduleRows.push(row);
                    }
                } else {
                    let activitySplit = a.activityCode.split("-");
                    row.eventId = activitySplit[0];
                    row.roundId = Number(activitySplit[1].substr(1));
                    if (activitySplit.length === 3) {
                        row.attemptId = Number(activitySplit[2].substr(1));
                    }

                    let index: number = scheduleRows.findIndex((x: ScheduleRowModel) => (x.eventId === row.eventId && x.roundId === row.roundId && x.attemptId === row.attemptId));
                    if (index >= 0) {
                        if (row.start < scheduleRows[index].start) {
                            scheduleRows[index].start = row.start;
                        }
                        if (row.end > scheduleRows[index].end) {
                            scheduleRows[index].end = row.end;
                        }
                    } else {
                        scheduleRows.push(row);
                    }
                }

            }
        }
    }
    return scheduleRows;
}


function sameDay(d1: Date, d2: Date): boolean {
    return (d1.getFullYear() === d2.getFullYear() && d1.getDay() === d2.getDay() && d1.getMonth() === d2.getMonth());
}

export { router } 
