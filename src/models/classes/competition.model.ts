import { autoserialize, autoserializeAs } from 'cerialize';
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

    @autoserializeAs(Date)
    public startDate: Date;

    @autoserializeAs(Date)
    public endDate: Date;

    @autoserialize
    public country: string;

    @autoserialize
    public province?: string;

    @autoserialize
    public region?: string;

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

    @autoserialize
    public logoURL?: string;

    @autoserialize
    public contactName: string;

    @autoserialize
    public contactEmail: string;

    @autoserialize
    public extraInformation?: string;

    @autoserialize
    public liveResultsURL?: string;

    @autoserialize
    public photoAlbumURL?: string;

    @autoserialize
    public isMultiLocation: boolean;

    @autoserializeAs(UserModel)
    public organizers?: UserModel[];

    @autoserializeAs(UserModel)
    public delegates?: UserModel[];

    @autoserializeAs(EventModel)
    public events?: EventModel[];

    public hasDelegate(id: number): boolean {
        let index: number = this.delegates.findIndex((u: UserModel) => u.id === id);
        return index >= 0;
    }

    public hasOrganizer(id: number): boolean {
        let index: number = this.organizers.findIndex((u: UserModel) => u.id === id);
        return index >= 0;
    }

    public getCompDate(): string {
        if ((this.startDate.getDate() === this.endDate.getDate()) && (this.startDate.getMonth() === this.endDate.getMonth()) && (this.startDate.getFullYear() === this.endDate.getFullYear())) {
            return this.startDate.toLocaleDateString("it-it", { day: "numeric", year: "numeric", month: "long" });
        } else {
            if (this.startDate.getMonth() < this.endDate.getMonth()) {
                return (this.startDate.toLocaleDateString("it-it", { day: "numeric", month: "long" })) + " - " + (this.endDate.toLocaleDateString("it-it", { day: "numeric", month: "long" })) + " " + (this.startDate.toLocaleDateString("it-it", { year: "numeric" }));
            } else {
                return (this.startDate.toLocaleDateString("it-it", { day: "numeric" })) + "-" + (this.endDate.toLocaleDateString("it-it", { day: "numeric", year: "numeric", month: "long" }));
            }
        }
    }

}