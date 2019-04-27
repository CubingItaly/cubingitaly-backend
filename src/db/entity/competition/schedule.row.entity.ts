import { ITransformable } from "../../transformable";
import { BaseEntity, Column, Entity, PrimaryColumn, ManyToMany, OneToMany, ManyToOne, PrimaryGeneratedColumn, JoinTable } from "typeorm";
import { ScheduleRowModel } from '../../../models/classes/competition/schedule.row.model';
import { ScheduleEntity } from "./schedule.entity";

@Entity()
export class ScheduleRowEntity extends BaseEntity implements ITransformable<ScheduleRowModel> {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public start: string;

    @Column()
    public end: string;

    @Column({ nullable: true })
    public name: string;

    @Column()
    public eventId: string;

    @Column({ nullable: true })
    public roundName: string;

    @Column({ nullable: true })
    public roundFormat: string;

    @Column({ nullable: true })
    public cutoff: string;

    @Column({ nullable: true })
    public timeLimit: string;

    @Column({ nullable: true })
    public advance: string;

    @Column({ nullable: true })
    public room: string;

    @ManyToOne(type => ScheduleEntity, schedule => schedule.rows, { onDelete: 'CASCADE' })
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
        model.cutoff = this.cutoff;
        model.room = this.room;
        model.start = this.start;
        model.end = this.end;
        model.advance = this.advance;
        return model;
    }

    _assimilate(origin: ScheduleRowModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.roundName = origin.roundName;
        this.roundFormat = origin.roundFormat;
        this.eventId = origin.eventId;
        this.timeLimit = origin.timeLimit;
        this.cutoff = origin.cutoff;
        this.room = origin.room;
        this.start = origin.start;
        this.advance = origin.advance;
        this.end = origin.end;
    }

}