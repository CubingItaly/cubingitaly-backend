import { ITransformable } from "../../transformable";
import { BaseEntity, Column, Entity, PrimaryColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, ManyToMany, OneToOne } from "typeorm";
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
    public guestsDetails: string;

    @Column({ nullable: false })
    public isLimitReached: boolean;
    PaymentMean
    @Column({ nullable: false })
    public isRegistrationOpen: boolean;

    @Column()
    public paypalLink: string;

    @Column({ nullable: false })
    public refundAvailable: boolean;

    @Column({ type: "text" })
    public registrationExtraInfo: string;

    @OneToMany(type => RefundPolicyEntity, policy => policy.registration, { eager: true })
    public refundPolicy: RefundPolicyEntity[];

    @ManyToMany(type => PaymentMeanEntity, paymentMean => paymentMean.registrations, { eager: true })
    public paymentMeans: PaymentMeanEntity[];

    @OneToOne(type => CompetitionEntity, competition => competition.registration)
    public competition: CompetitionEntity;

    _transform(): RegistrationModel {
        let model: RegistrationModel = new RegistrationModel();
        model.id = this.id;
        model.competitorsLimit = this.competitorsLimit;
        model.registrationOpen = this.registrationOpen;
        model.registrationClose = this.registrationClose;
        model.isRegistrationFree = this.isRegistrationFree;
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
        this.isRegistrationFree = origin.isRegistrationFree;
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