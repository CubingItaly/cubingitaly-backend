import { BaseCommonRepository } from "../../BaseCommonRepository";
import { EntityRepository } from "typeorm";
import { TravelMeanEntity } from "../../entity/competition/travelmean.entity";


@EntityRepository(TravelMeanEntity)
export class TravelMeanRepository extends BaseCommonRepository<TravelMeanEntity> {

    private means: string[] = ["Macchina", "Treno", "Aereo", "Taxi", "Metropolitana", "Autobus", "A piedi"];
    public _entityIdentifier: string = "TravelMeanEntity";

    public async InitDefaults(): Promise<void> {
        let count: number = await this.repository.count();
        if (count === 0) {
            for (let mean of this.means) {
                let temp: TravelMeanEntity = new TravelMeanEntity();
                temp.name = mean;
                await this.repository.save(temp);
            }
        }
    }

    public async getTravelMeans(): Promise<TravelMeanEntity[]> {
        return this.repository.find();
    }

    public async getTravelMean(id: number): Promise<TravelMeanEntity> {
        return this.repository.findOne(id);
    }

}