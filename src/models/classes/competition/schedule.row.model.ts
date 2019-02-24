import { autoserialize, autoserializeAs } from 'cerialize';

export class ScheduleRowModel {

    @autoserialize
    public id: number;

    @autoserialize
    public name?: string;

    @autoserialize
    public roundName?: string;

    @autoserialize
    public roundFormat?: string;

    @autoserialize
    public eventId?: string;

    @autoserialize
    public roundId?: number;

    @autoserialize
    public attemptId?: number;

    @autoserialize
    public format?: string;

    @autoserialize
    public timeLimit: number;

    @autoserialize
    public cumulativeTimeLimit: boolean;

    @autoserialize
    public cutoff?: number;

    @autoserialize
    public cutoffAttempts?: number;

    @autoserialize
    public advancementType?: string;

    @autoserialize
    public advancementLevel?: number;

    @autoserialize
    public room: string;

    @autoserializeAs(Date)
    public start: Date;

    @autoserializeAs(Date)
    public end: Date;
}