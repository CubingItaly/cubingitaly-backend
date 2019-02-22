import { BaseCommonRepository } from "../../BaseCommonRepository";
import { EntityRepository } from "typeorm";
import { DirectionsEntity } from "../../entity/competition/directions.entity";
import { CompetitionEntity } from "../../entity/competition.entity";


@EntityRepository(DirectionsEntity)
export class DirectionsRepository extends BaseCommonRepository<DirectionsEntity> {

    public _entityIdentifier: string = "DirectionsEntity";

    public async InitDefaults(): Promise<void> {
    }

    public async getDirections(competition: CompetitionEntity): Promise<DirectionsEntity[]> {
        return this.repository.find({ competition: competition });
    }

    public async getDirection(id: number): Promise<DirectionsEntity> {
        return this.repository.findOne(id);
    }

    public async deleteDirection(id: number): Promise<void> {
        await this.repository.delete(id);
        return;
    }

    public async updateDirection(direction: DirectionsEntity): Promise<DirectionsEntity> {
        return this.repository.save(direction);
    }

    public async createDirection(direction: DirectionsEntity, competition: CompetitionEntity): Promise<DirectionsEntity> {
        direction.competition = competition;
        return this.repository.save(direction);
    }

    public async getDirectionsByCompetition(competition: CompetitionEntity): Promise<DirectionsEntity[]> {
        return this.repository.find({ competition: competition });
    }

}
