import { ITransformable } from "../../transformable";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { RefundPolicyModel } from '../../../models/classes/competition/refundpolicy.model';
import { RegistrationEntity } from "./registration.entity";

@Entity()
export class RefundPolicyEntity extends BaseEntity implements ITransformable<RefundPolicyModel> {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false })
    public percentage: number;

    @Column({ nullable: false })
    public deadline: Date;

    @ManyToOne(type=> RegistrationEntity, registration=>registration.policies)
    public registration: RegistrationEntity;


    _transform(): RefundPolicyModel {
        let model: RefundPolicyModel = new RefundPolicyModel();
        model.id = this.id;
        model.percentage = this.percentage;
        model.deadline = this.deadline;
        return model;
    }

    _assimilate(origin: RefundPolicyModel) {
        this.id = origin.id;
        this.percentage = origin.percentage;
        this.deadline = origin.deadline;
    }

}