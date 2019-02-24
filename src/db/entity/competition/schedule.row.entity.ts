import { ITransformable } from "../../transformable";
import { BaseEntity, Column, Entity, PrimaryColumn, ManyToMany, OneToMany, ManyToOne, PrimaryGeneratedColumn, JoinTable } from "typeorm";
import { ScheduleRowModel } from '../../../models/classes/competition/schedule.row.model';
import { ScheduleEntity } from "./schedule.entity";

@Entity()
export class ScheduleRowEntity extends BaseEntity implements ITransformable<ScheduleRowModel> {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: true })
    public name: string;

    @Column()
    public eventId: string;

    @Column({ nullable: true })
    public roundName: string;

    @Column({ nullable: true })
    public roundFormat: string;

    @Column({ nullable: true })
    public timeLimit: number;

    @Column({ default: false })
    public cumulativeTimeLimit: boolean;

    @Column({ nullable: true })
    public cutoff: number;

    @Column({ nullable: true })
    public advancementType: string;

    @Column({ nullable: true })
    public advancementLevel: number;

    @Column({ nullable: true })
    public room: string;

    @Column()
    public start: Date;

    @Column()
    public end: Date;

    @ManyToOne(type => ScheduleEntity, schedule => schedule.rows, {onDelete:'CASCADE'})
    @JoinTable()
    public schedule: ScheduleEntity;

    _transform(): ScheduleRowModel {
        let model: ScheduleRowModel = new ScheduleRowModel;
        model.id = this.id;
        model.name = this.name;
        model.roundName = this.roundName;
        model.roundFormat = this.roundFormat;
        model.eventId = this.eventId;
        model.timeLimit = this.timeLimit;
        model.cumulativeTimeLimit = this.cumulativeTimeLimit;
        model.cutoff = this.cutoff;
        model.advancementType = this.advancementType;
        model.advancementLevel = this.advancementLevel;
        model.room = this.room;
        model.start = this.start;
        model.end = this.end;
        return model;
    }

    _assimilate(origin: ScheduleRowModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.roundName = origin.roundName;
        this.roundFormat = origin.roundFormat;
        this.eventId = origin.eventId;
        this.timeLimit = origin.timeLimit;
        this.cumulativeTimeLimit = origin.cumulativeTimeLimit;
        this.cutoff = origin.cutoff;
        this.advancementType = origin.advancementType;
        this.advancementLevel = origin.advancementLevel;
        this.room = origin.room;
        this.start = origin.start;
        this.end = origin.end;
    }

}