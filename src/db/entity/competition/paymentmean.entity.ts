import { ITransformable } from "../../transformable";
import { BaseEntity, Column, Entity, PrimaryColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { PaymentMeanModel } from '../../../models/classes/competition/paymentmean.model';
import { RegistrationEntity } from './registration.entity';

@Entity()
export class PaymentMeanEntity extends BaseEntity implements ITransformable<PaymentMeanModel> {

    @PrimaryColumn()
    public id: string;

    @Column({ nullable: false })
    public name: string;

    @Column({ nullable: false, type: "text" })
    public details: string;

    @ManyToMany(type => RegistrationEntity, registration => registration.paymentMeans)
    public registrations: RegistrationEntity;

    _transform(): PaymentMeanModel {
        let model: PaymentMeanModel = new PaymentMeanModel();
        model.id = this.id;
        model.details = this.details;
        model.name = this.name;
        return model;
    }

    _assimilate(origin: PaymentMeanModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.details = origin.details;
    }

}