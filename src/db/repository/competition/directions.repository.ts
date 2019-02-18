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
        let old: DirectionsEntity = await this.getDirection(direction.id);
        if (old && old.competition.id === direction.competition.id) {
            old.directions = direction.directions;
            old.mean = direction.mean;
            return this.repository.save(old);
        } else {
            return;
        }
    }

    public async createDirection(direction: DirectionsEntity): Promise<DirectionsEntity> {
        if (direction.id) {
            return;
        } else {
            return this.repository.save(direction);
        }
    }
}
