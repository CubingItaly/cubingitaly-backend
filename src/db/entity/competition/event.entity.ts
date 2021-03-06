import { ITransformable } from "../../transformable";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, UpdateDateColumn, PrimaryColumn, ManyToMany } from "typeorm";
import { EventModel } from '../../../models/classes/competition/event.model';
import { CompetitionEntity } from "../competition.entity";

@Entity()
export class EventEntity extends BaseEntity implements ITransformable<EventModel> {

    @PrimaryColumn()
    public id: string;

    @Column({ nullable: false })
    public name: string;

    @Column({ nullable: false })
    public weight: number;

    @ManyToMany(type => CompetitionEntity, competition => competition.events)
    public competitions: CompetitionEntity[];

    _transform(): EventModel {
        let model: EventModel = new EventModel();
        model.id = this.id;
        model.name = this.name;
        model.weight = this.weight;
        return model;
    }

    _assimilate(origin: EventModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.weight = origin.weight;
    }

}