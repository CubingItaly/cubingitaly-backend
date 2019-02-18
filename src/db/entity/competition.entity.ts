import { ITransformable } from "../transformable";
import { BaseEntity, Column, Entity, PrimaryColumn, ManyToMany, OneToMany, ManyToOne, PrimaryGeneratedColumn, OneToOne } from "typeorm";
import { CompetitionModel } from '../../models/classes/competition.model';
import { DirectionsEntity } from "./competition/directions.entity";
import { RegistrationEntity } from "./competition/registration.entity";

@Entity()
export class CompetitionEntity extends BaseEntity implements ITransformable<CompetitionModel> {

    @PrimaryColumn()
    public id: string;

    @OneToMany(type => DirectionsEntity, directions => directions.competition)
    public directions: DirectionsEntity[];

    @OneToOne(type => RegistrationEntity, registration => registration.competition)
    public registration: RegistrationEntity;

    _transform(): CompetitionModel {
        let model: CompetitionModel = new CompetitionModel();
        return model;
    }

    _assimilate(origin: CompetitionModel) {
    }

}