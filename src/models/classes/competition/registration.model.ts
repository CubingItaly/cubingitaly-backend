import { autoserialize, autoserializeAs } from 'cerialize';
import { RefundPolicyModel } from './refundpolicy.model';
import { PaymentMeanModel } from './paymentmean.model';

export class RegistrationModel {

    @autoserialize
    public id: number;

    @autoserialize
    public competitorsLimit: number;

    @autoserializeAs(Date)
    public registrationOpen: Date;

    @autoserializeAs(Date)
    public registrationClose: Date;

    @autoserialize
    public isRegistrationPaid: boolean;

    @autoserialize
    public registrationFee?: number;

    @autoserialize
    public newcomerDiscount: boolean;

    @autoserialize
    public newcomerFee?: number;

    @autoserialize
    public newcomerDetails?: string;

    @autoserialize
    public registrationAtTheVenue: boolean;

    @autoserialize
    public atTheVenueFee?: number;

    @autoserialize
    public atTheVenueDetails?: string;

    @autoserialize
    public maxNumberOfGuests?: number;

    @autoserialize
    public guestsPay: boolean;

    @autoserialize
    public guestsFee?: number;

    @autoserialize
    public guestsNeedToRegister: boolean;

    @autoserialize
    public guestsDetails?: string;

    @autoserialize
    public isLimitReached: boolean;

    @autoserialize
    public isRegistrationClosed: boolean;

    @autoserialize
    public paypalLink?: string;

    @autoserialize
    public refundAvailable: boolean;

    @autoserializeAs(RefundPolicyModel)
    public refundPolicy?: RefundPolicyModel[];

    @autoserializeAs(PaymentMeanModel)
    public paymentMeans?: PaymentMeanModel[];

    @autoserialize
    public registrationExtraInfo?: string;

    @autoserialize
    public isComplete: boolean;

}
