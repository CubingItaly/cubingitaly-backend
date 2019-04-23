import { ITransformable } from "../../transformable";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ExtraTabModel } from '../../../models/classes/competition/extratab.model';
import { CompetitionEntity } from '../competition.entity';

@Entity()
export class ExtraTabEntity extends BaseEntity implements ITransformable<ExtraTabModel> {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column()
    public content: string;

    @Column()
    public index: number;

    @ManyToOne(type => CompetitionEntity, competition => competition.extraTabs, { onDelete: "CASCADE" })
    public competition: CompetitionEntity;

    _transform(): ExtraTabModel {
        let tab: ExtraTabModel = new ExtraTabModel();
        tab.id = this.id;
        tab.name = this.name;
        tab.content = this.content;
        tab.index = this.index;
        return tab;
    }

    _assimilate(origin: ExtraTabEntity) {
        this.id = origin.id;
        this.name = origin.name;
        this.content = origin.content;
        this.index = origin.index;
    }

}