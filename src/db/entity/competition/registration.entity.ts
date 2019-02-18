import { ITransformable } from "../../transformable";
import { BaseEntity, Column, Entity, PrimaryColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { RegistrationModel } from '../../../models/classes/competition/registration.model';
import { RefundPolicyEntity } from "./refundpolicy.entity";
import { PaymentMeanEntity } from "./paymentmean.entity";

@Entity()
export class RegistrationEntity extends BaseEntity implements ITransformable<RegistrationModel> {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false })
    public competitorsLimit: number;

    @Column({ nullable: false })
    public registrationOpen: Date;

    @Column({ nullable: false })
    public registrationClose: Date;

    @Column({ nullable: false })
    public isRegistrationFree: boolean;

    @Column()
    public registrationFee: number;

    @Column({ nullable: false })
    public newcomerDiscount: boolean;

    @Column()
    public newcomerFee: number;

    @Column({ type: "text" })
    public newcomerDetails: string;

    @Column({ nullable: false })
    public registrationAtTheVenue: boolean;

    @Column()
    public atTheVenueFee: number;

    @Column({ type: "text" })
    public atTheVenueDetails: string;

    @Column()
    public maxNumberOfGuests: number;

    @Column({ nullable: false })
    public guestsPay: boolean;

    @Column()
    public guestsFee: number;

    @Column({ nullable: false })
    public guestsNeedToRegister: boolean;

    @Column({ type: "text" })
    public guestDetails: string;

    @Column({ nullable: false })
    public isLimitReached: boolean;

    @Column({ nullable: false })
    public isRegistrationOpen: boolean;

    @Column()
    public paypalLink: string;

    @Column({ nullable: false })
    public refundAvailable: boolean;

    @Column({ type: "text" })
    public registrationExtraInfo: string;

    @OneToMany(type => RefundPolicyEntity, policy => policy.registration, { eager: true })
    public policies: RefundPolicyEntity[];

    @ManyToMany(type => PaymentMeanEntity, paymentMean => paymentMean.registrations, { eager: true })
    public paymentMeans: PaymentMeanEntity[];


    _transform(): RegistrationModel {
        let model: RegistrationModel = new RegistrationModel();
        model.id = this.id;
        return model;
    }

    _assimilate(origin: RegistrationModel) {
        this.id = origin.id;
    }

}