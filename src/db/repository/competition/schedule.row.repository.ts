import { BaseCommonRepository } from "../../BaseCommonRepository";
import { EntityRepository } from "typeorm";
import { ScheduleRowEntity } from '../../entity/competition/schedule.row.entity';
import { CompetitionEntity } from "../../entity/competition.entity";


@EntityRepository(ScheduleRowEntity)
export class ScheduleRowRepository extends BaseCommonRepository<ScheduleRowEntity> {

    public _entityIdentifier: string = "ScheduleRowEntity";

    public async InitDefaults(): Promise<void> {

    }
}