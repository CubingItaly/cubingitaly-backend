import { ITransformable } from "../../transformable";
import { BaseEntity, Column, Entity, PrimaryColumn, ManyToMany, OneToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DirectionsModel } from '../../../models/classes/competition/directions.model';
import { CompetitionEntity } from '../competition.entity';
import { TravelMeanEntity } from "./travelmean.entity";

@Entity()
export class DirectionsEntity extends BaseEntity implements ITransformable<DirectionsModel> {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false, type: "text" })
    public directions: string;

    @ManyToOne(type => TravelMeanEntity, mean => mean.directions, { nullable: false, eager: true })
    public mean: TravelMeanEntity;

    @ManyToOne(type => CompetitionEntity, competition => competition.directions)
    public competition: CompetitionEntity;

    _transform(): DirectionsModel {
        let model: DirectionsModel = new DirectionsModel();
        model.id = this.id;
        model.directions = this.directions;
        model.mean = this.mean._transform();
        return model;
    }

    _assimilate(origin: DirectionsModel) {
        this.id = origin.id;
        this.directions = origin.directions;
        this.mean = new TravelMeanEntity();
        this.mean._assimilate(origin.mean);
    }

}