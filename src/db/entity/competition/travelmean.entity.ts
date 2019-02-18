import { ITransformable } from "../../transformable";
import { BaseEntity, Column, Entity, PrimaryColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TravelMeanModel } from '../../../models/classes/competition/travelmean.model';
import { DirectionsEntity } from "./directions.entity";

@Entity()
export class TravelMeanEntity extends BaseEntity implements ITransformable<TravelMeanModel> {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false })
    public name: string;

    @OneToMany(type => DirectionsEntity, direction => direction.mean)
    public directions: DirectionsEntity[];


    _transform(): TravelMeanModel {
        let model: TravelMeanModel = new TravelMeanModel();
        model.id = this.id;
        model.name = this.name;
        return model;
    }

    _assimilate(origin: TravelMeanModel) {
        this.id = origin.id;
        this.name = origin.name;
    }

}