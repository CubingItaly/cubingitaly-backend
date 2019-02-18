import { BaseCommonRepository } from "../../BaseCommonRepository";
import { EntityRepository } from "typeorm";
import { RegistrationEntity } from "../../entity/competition/registration.entity";
import { CompetitionEntity } from "../../entity/competition.entity";


@EntityRepository(RegistrationEntity)
export class RegistrationRepository extends BaseCommonRepository<RegistrationEntity> {

    public _entityIdentifier: string = "RegistrationEntity";

    public async InitDefaults(): Promise<void> {

    }

    public async getRegistration(id: number): Promise<RegistrationEntity> {
        return this.repository.findOne(id);
    }

    public async getRegistrationByCompetition(competition: CompetitionEntity): Promise<RegistrationEntity> {
        return this.repository.findOne({ competition: competition });
    }

    public async deleteRegistration(id: number): Promise<void> {
        await this.repository.delete(id);
        return;
    }

    public async updateRegistration(registration: RegistrationEntity): Promise<RegistrationEntity> {
        let old: RegistrationEntity = await this.getRegistration(registration.id);
        if (old) {
            return this.repository.save(registration);
        } else {
            return;
        }
    }

    public async createRegistration(competition: CompetitionEntity, registration: RegistrationEntity): Promise<RegistrationEntity> {
        if (registration.id) {
            return;
        } else {
            registration.competition = competition;
            return this.repository.save(registration);
        }
    }
}