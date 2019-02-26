import { Router } from "express";
import * as passport from 'passport';
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
import { keys } from "../../secrets/keys";
import { canEditCompetition, getCompetitionRepository, getScheduleRepository } from "../../shared/competition.utils";
import { UserEntity } from "../../db/entity/user.entity";
import { ScheduleEntity } from "../../db/entity/competition/schedule.entity";


const router: Router = Router();

let scheduleRequests: Map<number, string> = new Map<number, string>();

async function isOrganizerOrDelegate(req, res, next) {
    let competition: CompetitionEntity = await getCompetitionRepository().getCompetition(req.params.id);
    let model: CompetitionModel = competition._transform();
    if (getUser(req).isDelOrgOf(model)) {
        next();
    } else {
        sendError(res, 403, "Error! To perform this action you must be organizer or delegate of the competition.");
    }
}

/**
 * Redirect the user to the WCA website to ask for the permissions 
 */
router.get("/:id/wca", verifyLogin, isOrganizerOrDelegate, async (req, res) => {
    scheduleRequests[getUser(req).id] = req.params.id;
    res.redirect(`https://staging.worldcubeassociation.org/oauth/authorize?client_id=${keys.wca.dev.client_id}&response_type=code&redirect_uri=http://localhost:4200/api/v0/competitions/schedule/wca/callback&scope=manage_competitions`);
});

router.get("/wca/callback", verifyLogin, async (req, res) => {
    let code = req.query.code;
    if (code) {
        let body = await request({
            method: 'POST',
            url: 'https://staging.worldcubeassociation.org/oauth/token',
            body: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: 'http://localhost:4200/api/v0/competitions/schedule/wca/callback',
                client_id: keys.wca.dev.client_id,
                client_secret: keys.wca.dev.client_secret
            },
            json: true
        });
        if (body.access_token) {
            let token = body.access_token;
            let wcif = await request({
                url: `https://staging.worldcubeassociation.org/api/v0/competitions/${scheduleRequests[getUser(req).id]}/wcif`,
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
        } else {
            sendError(res, 400, "Bad request. The request is malformed.");
        }
    } else {
        sendError(res, 400, "Bad request. The request is malformed.");
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


const roundNames = [
    { 1: "Finale" },
    { 1: "Primo turno", 2: "Finale" },
    { 1: "Primo turno", 2: "Secondo turno", 3: "Finale" },
    { 1: "Primo turno", 2: "Secondo turno", 3: "Semifinale", 4: "Finale" }
];


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
            let roundsNumber: number = scheduleRows.filter((e: ScheduleRowModel) => e.eventId === s.eventId).length - 1;
            round = roundNames[roundsNumber][s.roundId];

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
                s.timeLimit = assignTimeLimit(r);
                s.cutoff = assignCutOff(r);
                if (r.cutoff) {
                    s.cutoffAttempts = r.cutoff.numberOfAttempts;
                }
                s.advance = assignAdvancement(r);
                rowsWithInfo.push(s);
            }
        }
    }
    return rowsWithInfo;

}

function assignTimeLimit(round): string {
    if (round.timeLimit) {
        let cutoff: Date = new Date(round.timeLimit.centiseconds * 10);
        let hours: string = `${cutoff.getHours() - 1}`;
        let minutes: string = `0${cutoff.getMinutes()}`.slice(-2);
        let seconds: string = `0${cutoff.getSeconds()}`.slice(-2);
        let result: string = "";
        if (hours === "0") {
            result = `${minutes}:${seconds}`;
        } else {
            result = `${hours}:${minutes}:${seconds}`;
        }
        if (round.timeLimit.cumulativeRoundIds.length === 1) {
            result += " cumulativo";
        } else if (round.timeLimit.cumulativeRoundIds.length > 1) {
            result += " cumulativo con altri eventi";
        }
    }
    return null;
}

function assignCutOff(round): string {
    if (round.cutoff) {
        let cutoff: Date = new Date(round.cutoff.attemptResult * 10);
        let minutes: string = `0${cutoff.getMinutes()}`.slice(-2);
        let seconds: string = `0${cutoff.getSeconds()}`.slice(-2);
        if (minutes === "00") {
            return `${seconds}s`;
        } else {
            return `${minutes}:${seconds}`;
        }
    }
    return null;
}

function assignAdvancement(round): string {
    let a = round.advancementCondition
    if (a) {
        if (a.type === "ranking") {
            return `${a.level}`;
        } else if (a.type = "percent") {
            return `${a.level}%`
        }
    }
    return null;
}

function getRows(venues): ScheduleRowModel[] {
    let scheduleRows: ScheduleRowModel[] = [];
    for (let v of venues) {
        for (let r of v.rooms) {
            for (let a of r.activities) {
                let row: ScheduleRowModel = new ScheduleRowModel();
                row.start = new Date(a.startTime);
                row.end = new Date(a.endTime);
                row.room = r.name;
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
