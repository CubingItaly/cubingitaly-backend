import { autoserialize, autoserializeAs } from 'cerialize';
import { DirectionsModel } from './competition/directions.model';
import { UserModel } from './user.model';
import { EventModel } from './competition/event.model';

export class CompetitionModel {

    @autoserialize
    public id: string;

    @autoserialize
    public name: string;

    @autoserialize
    public isOfficial: boolean;

    @autoserialize
    public isHidden: boolean;

    @autoserialize
    public startDate: Date;

    @autoserialize
    public endDate: Date;

    @autoserialize
    public country: string;

    @autoserialize
    public province?: string;

    @autoserialize
    public city: string;

    @autoserialize
    public address: string;

    @autoserialize
    public addressURL?: string;

    @autoserialize
    public location: string;

    @autoserialize
    public locationURL?: string;

    @autoserialize
    public locationDetails?: string;

    @autoserialize
    public coordinates?: string;

    @autoserializeAs(DirectionsModel)
    public directions?: DirectionsModel[];

    @autoserialize
    public logoURL?: string;

    @autoserialize
    public contactName: string;

    @autoserialize
    public contactEmail: string;

    @autoserializeAs(UserModel)
    public organizers?: UserModel[];

    @autoserializeAs(UserModel)
    public delegates?: UserModel[];

    @autoserialize
    public extraInformation?: string;

    @autoserializeAs(EventModel)
    public events?: EventModel;

}