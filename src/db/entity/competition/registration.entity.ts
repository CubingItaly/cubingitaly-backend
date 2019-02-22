import { ITransformable } from "../../transformable";
import { BaseEntity, Column, Entity, PrimaryColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, ManyToMany, OneToOne, JoinTable, JoinColumn } from "typeorm";
import { RegistrationModel } from '../../../models/classes/competition/registration.model';
import { RefundPolicyEntity } from "./refundpolicy.entity";
import { PaymentMeanEntity } from "./paymentmean.entity";
import { RefundPolicyModel } from "../../../models/classes/competition/refundpolicy.model";
import { PaymentMeanModel } from "../../../models/classes/competition/paymentmean.model";
import { CompetitionEntity } from "../competition.entity";

@Entity()
export class RegistrationEntity extends BaseEntity implements ITransformable<RegistrationModel> {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ default: 0 })
    public competitorsLimit: number;

    @Column({ nullable: true })
    public registrationOpen: Date;

    @Column({ nullable: true })
    public registrationClose: Date;

    @Column({ default: false })
    public isRegistrationPaid: boolean;

    @Column({ nullable: true })
    public registrationFee: number;

    @Column({ default: false })
    public newcomerDiscount: boolean;

    @Column({ nullable: true })
    public newcomerFee: number;

    @Column({ type: "text", nullable: true })
    public newcomerDetails: string;

    @Column({ default: false })
    public registrationAtTheVenue: boolean;

    @Column({ nullable: true })
    public atTheVenueFee: number;

    @Column({ type: "text", nullable: true })
    public atTheVenueDetails: string;

    @Column({ nullable: true })
    public maxNumberOfGuests: number;

    @Column({ default: false })
    public guestsPay: boolean;

    @Column({ nullable: true })
    public guestsFee: number;

    @Column({ default: false })
    public guestsNeedToRegister: boolean;

    @Column({ type: "text", nullable: true })
    public guestsDetails: string;

    @Column({ default: false })
    public isLimitReached: boolean;

    @Column({ default: false })
    public isRegistrationOpen: boolean;

    @Column({ nullable: true })
    public paypalLink: string;

    @Column({ default: false })
    public refundAvailable: boolean;

    @Column({ type: "text", nullable: true })
    public registrationExtraInfo: string;

    @Column({default:false})
    public isComplete:boolean;

    @OneToMany(type => RefundPolicyEntity, policy => policy.registration, { cascade: true, eager: true })
    public refundPolicy: RefundPolicyEntity[];

    @ManyToMany(type => PaymentMeanEntity, paymentMean => paymentMean.registrations, { eager: true })
    @JoinTable()
    public paymentMeans: PaymentMeanEntity[];

    @OneToOne(type => CompetitionEntity, competition => competition.registration)
    @JoinColumn()
    public competition: CompetitionEntity;

    _transform(): RegistrationModel {
        let model: RegistrationModel = new RegistrationModel();
        model.id = this.id;
        model.competitorsLimit = this.competitorsLimit;
        model.registrationOpen = this.registrationOpen;
        model.registrationClose = this.registrationClose;
        model.isRegistrationPaid = this.isRegistrationPaid;
        model.registrationFee = this.registrationFee;
        model.newcomerDiscount = this.newcomerDiscount;
        model.newcomerFee = this.newcomerFee;
        model.newcomerDetails = this.newcomerDetails;
        model.registrationAtTheVenue = this.registrationAtTheVenue;
        model.atTheVenueFee = this.atTheVenueFee;
        model.atTheVenueDetails = this.atTheVenueDetails;
        model.maxNumberOfGuests = this.maxNumberOfGuests;
        model.guestsPay = this.guestsPay;
        model.guestsFee = this.guestsFee;
        model.guestsNeedToRegister = this.guestsNeedToRegister;
        model.guestsDetails = this.guestsDetails;
        model.isLimitReached = this.isLimitReached;
        model.isRegistrationOpen = this.isRegistrationOpen;
        model.paypalLink = this.paypalLink;
        model.refundAvailable = this.refundAvailable;
        model.registrationExtraInfo = this.registrationExtraInfo;
        if (this.refundPolicy) {
            model.refundPolicy = this.refundPolicy.map((p: RefundPolicyEntity) => p._transform());
        }
        if (this.paymentMeans) {
            model.paymentMeans = this.paymentMeans.map((p: PaymentMeanEntity) => p._transform());
        }

        return model;
    }

    _assimilate(origin: RegistrationModel) {
        this.id = origin.id;
        this.competitorsLimit = origin.competitorsLimit;
        this.registrationOpen = origin.registrationOpen;
        this.registrationClose = origin.registrationClose;
        this.isRegistrationPaid = origin.isRegistrationPaid;
        this.registrationFee = origin.registrationFee;
        this.newcomerDiscount = origin.newcomerDiscount;
        this.newcomerFee = origin.newcomerFee;
        this.newcomerDetails = origin.newcomerDetails;
        this.registrationAtTheVenue = origin.registrationAtTheVenue;
        this.atTheVenueFee = origin.atTheVenueFee;
        this.atTheVenueDetails = origin.atTheVenueDetails;
        this.maxNumberOfGuests = origin.maxNumberOfGuests;
        this.guestsPay = origin.guestsPay;
        this.guestsFee = origin.guestsFee;
        this.guestsNeedToRegister = origin.guestsNeedToRegister;
        this.guestsDetails = origin.guestsDetails;
        this.isLimitReached = origin.isLimitReached;
        this.isRegistrationOpen = origin.isRegistrationOpen;
        this.paypalLink = origin.paypalLink;
        this.refundAvailable = origin.refundAvailable;
        this.registrationExtraInfo = origin.registrationExtraInfo;
        if (origin.paymentMeans) {
            this.paymentMeans = origin.paymentMeans.map((p: PaymentMeanModel) => {
                let temp: PaymentMeanEntity = new PaymentMeanEntity();
                temp._assimilate(p);
                return temp;
            });
        }
        if (origin.refundPolicy) {
            this.refundPolicy = origin.refundPolicy.map((p: RefundPolicyModel) => {
                let temp: RefundPolicyEntity = new RefundPolicyEntity();
                temp._assimilate(p);
                return temp;
            });
        }
    }

}