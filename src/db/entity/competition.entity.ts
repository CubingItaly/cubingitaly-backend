import { ITransformable } from "../transformable";
import { BaseEntity, Column, Entity, PrimaryColumn, ManyToMany, OneToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompetitionModel } from '../../models/classes/competition.model';
import { DirectionsEntity } from "./competition/directions.entity";

@Entity()
export class CompetitionEntity extends BaseEntity implements ITransformable<CompetitionModel> {

    @PrimaryColumn()
    public id: string;

    @OneToMany(type => DirectionsEntity, directions => directions.competition)
    public directions: DirectionsEntity[];

    _transform(): CompetitionModel {
        let model: CompetitionModel = new CompetitionModel();
        return model;
    }

    _assimilate(origin: CompetitionModel) {
    }

}