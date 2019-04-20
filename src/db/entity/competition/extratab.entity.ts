import { ITransformable } from "../../transformable";
import { BaseEntity, Column, Entity, PrimaryColumn, ManyToOne } from "typeorm";
import { ExtraTabModel } from '../../../models/classes/competition/extratab.model';
import { CompetitionEntity } from '../competition.entity';

@Entity()
export class ExtraTabEntity extends BaseEntity implements ITransformable<ExtraTabModel> {

    @PrimaryColumn()
    public id: string;

    @Column()
    public title: string;

    @Column()
    public content: string;

    @ManyToOne(type => CompetitionEntity, competition => competition.extraTabs, { onDelete: "CASCADE" })
    public competition: CompetitionEntity;

    _transform(): ExtraTabEntity {
        return null
    }

    _assimilate(origin: ExtraTabEntity) {
    }

}