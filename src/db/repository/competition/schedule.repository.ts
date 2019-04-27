import { BaseCommonRepository } from "../../BaseCommonRepository";
import { EntityRepository } from "typeorm";
import { ScheduleEntity } from '../../entity/competition/schedule.entity';
import { CompetitionEntity } from "../../entity/competition.entity";


@EntityRepository(ScheduleEntity)
export class ScheduleRepository extends BaseCommonRepository<ScheduleEntity> {

    public _entityIdentifier: string = "ScheduleEntity";

    public async InitDefaults(): Promise<void> {

    }


    public async insertSchedule(competition: CompetitionEntity, schedule: ScheduleEntity[]): Promise<ScheduleEntity[]> {
        await this.deleteSchedule(competition);
        for (let s of schedule) {
            s.competition = competition;
        }

        return this.repository.save(schedule);
    }

    public async getSchedule(competition: CompetitionEntity): Promise<ScheduleEntity[]> {
        return this.repository.find({ competition: competition });
    }

    private async deleteSchedule(competition: CompetitionEntity): Promise<void> {
        await this.repository.delete({ competition: competition });
        return;
    }
}