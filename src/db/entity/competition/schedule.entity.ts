import { ITransformable } from "../../transformable";
import { BaseEntity, Column, Entity, PrimaryColumn, ManyToMany, OneToMany, ManyToOne, PrimaryGeneratedColumn, JoinTable } from "typeorm";
import { ScheduleModel } from '../../../models/classes/competition/schedule.model';
import { CompetitionEntity } from '../competition.entity';
import { ScheduleRowEntity } from "./schedule.row.entity";
import { ScheduleRowModel } from "../../../models/classes/competition/schedule.row.model";

@Entity()
export class ScheduleEntity extends BaseEntity implements ITransformable<ScheduleModel> {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public day: Date;

    @Column()
    public dayIndex: number;

    @ManyToOne(type => CompetitionEntity, competition => competition.schedule)
    @JoinTable()
    public competition: CompetitionEntity;

    @OneToMany(type => ScheduleRowEntity, row => row.schedule, { cascade: true, eager: true })
    public rows: ScheduleRowEntity[];

    _transform(): ScheduleModel {
        let model: ScheduleModel = new ScheduleModel();
        model.id = this.id;
        model.day = this.day;
        model.dayIndex = this.dayIndex
        model.rows = this.rows.map((r: ScheduleRowEntity) => r._transform());
        return model;
    }

    _assimilate(origin: ScheduleModel) {
        this.id = origin.id;
        this.day = origin.day;
        this.dayIndex = origin.dayIndex
        this.rows = origin.rows.map((r: ScheduleRowModel) => {
            let temp: ScheduleRowEntity = new ScheduleRowEntity()
            temp._assimilate(r);
            return temp;
        });
    }

}