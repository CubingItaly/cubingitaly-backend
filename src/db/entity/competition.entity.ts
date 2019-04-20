import { ITransformable } from "../transformable";
import { BaseEntity, Column, Entity, PrimaryColumn, ManyToMany, OneToMany, ManyToOne, PrimaryGeneratedColumn, OneToOne, JoinTable, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { CompetitionModel } from '../../models/classes/competition.model';
import { DirectionsEntity } from "./competition/directions.entity";
import { RegistrationEntity } from "./competition/registration.entity";
import { EventEntity } from "./competition/event.entity";
import { EventModel } from "../../models/classes/competition/event.model";
import { UserEntity } from "./user.entity";
import { UserModel } from "../../models/classes/user.model";
import { ScheduleEntity } from "./competition/schedule.entity";
import { ExtraTabEntity } from "./competition/extratab.entity";

@Entity()
export class CompetitionEntity extends BaseEntity implements ITransformable<CompetitionModel> {

    @PrimaryColumn()
    public id: string;

    @CreateDateColumn()
    public createDate: Date;

    @Column()
    public updateDate: Date;

    @Column()
    public name: string;

    @Column({ default: false })
    public isOfficial: boolean;

    @Column({ default: true })
    public isHidden: boolean;

    @Column()
    public startDate: Date;

    @Column()
    public endDate: Date;

    @Column()
    public country: string;

    @Column({ nullable: true })
    public region: string

    @Column({ nullable: true })
    public province: string;

    @Column()
    public city: string;

    @Column()
    public address: string;

    @Column({ nullable: true })
    public addressURL: string;

    @Column()
    public location: string;

    @Column({ nullable: true })
    public locationURL: string;

    @Column({ nullable: true })
    public locationDetails: string;

    @Column({ nullable: true })
    public coordinates: string;

    @Column({ nullable: true })
    public logoURL: string;

    @Column({ nullable: true })
    public liveResultsURL: string;

    @Column()
    public contactName: string;

    @Column()
    public contactEmail: string;

    @Column({ type: "text", nullable: true })
    public extraInformation: string;

    @OneToMany(type => DirectionsEntity, directions => directions.competition, { nullable: true })
    public directions: DirectionsEntity[];

    @OneToOne(type => RegistrationEntity, registration => registration.competition, { nullable: true })
    public registration: RegistrationEntity;

    @ManyToMany(type => EventEntity, event => event.competitions, { eager: true, nullable: false })
    @JoinTable()
    public events: EventEntity[];

    @ManyToMany(type => UserEntity, user => user.delegatedCompetitions, { eager: true, nullable: false })
    @JoinTable()
    public delegates: UserEntity[];

    @ManyToMany(type => UserEntity, user => user.organizedCompetitions, { eager: true, nullable: false })
    @JoinTable()
    public organizers: UserEntity[];

    @OneToMany(type => ScheduleEntity, schedule => schedule.competition)
    public schedule: ScheduleEntity[];

    @OneToMany(type => ExtraTabEntity, tab => tab.competition)
    public extraTabs: ExtraTabEntity[];


    _transform(): CompetitionModel {
        let model: CompetitionModel = new CompetitionModel();
        model.id = this.id;
        model.name = this.name;
        model.isOfficial = this.isOfficial;
        model.isHidden = this.isHidden;
        model.startDate = this.startDate;
        model.endDate = this.endDate;
        model.country = this.country;
        model.region = this.region;
        model.province = this.province;
        model.city = this.city;
        model.address = this.address;
        model.addressURL = this.addressURL;
        model.location = this.location;
        model.locationURL = this.locationURL;
        model.locationDetails = this.locationDetails;
        model.coordinates = this.coordinates;
        model.logoURL = this.logoURL;
        model.liveResultsURL = this.liveResultsURL;
        model.contactName = this.contactName;
        model.contactEmail = this.contactEmail;
        model.extraInformation = this.extraInformation;
        if (this.events) {
            model.events = this.events.map((e: EventEntity) => e._transform());
        }
        if (this.delegates) {
            model.delegates = this.delegates.map((d: UserEntity) => d._transform());
        }
        if (this.organizers) {
            model.organizers = this.organizers.map((d: UserEntity) => d._transform());
        }
        return model;
    }

    _assimilate(origin: CompetitionModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.isOfficial = origin.isOfficial;
        this.isHidden = origin.isHidden;
        this.startDate = origin.startDate;
        this.endDate = origin.endDate;
        this.country = origin.country;
        this.region = origin.region;
        this.province = origin.province;
        this.city = origin.city;
        this.address = origin.address;
        this.addressURL = origin.addressURL;
        this.location = origin.location;
        this.locationURL = origin.locationURL;
        this.locationDetails = origin.locationDetails;
        this.coordinates = origin.coordinates;
        this.logoURL = origin.logoURL;
        this.liveResultsURL = origin.liveResultsURL;
        this.contactName = origin.contactName;
        this.contactEmail = origin.contactEmail;
        this.extraInformation = origin.extraInformation;
        if (origin.events) {
            this.events = origin.events.map((e: EventModel) => {
                let temp: EventEntity = new EventEntity();
                temp._assimilate(e);
                return temp;
            })
        }
        if (origin.delegates) {
            this.delegates = origin.delegates.map((d: UserModel) => {
                let temp: UserEntity = new UserEntity();
                temp._assimilate(d);
                return temp;
            })
        }

        if (origin.organizers) {
            this.organizers = origin.organizers.map((d: UserModel) => {
                let temp: UserEntity = new UserEntity();
                temp._assimilate(d);
                return temp;
            })
        }
    }

}