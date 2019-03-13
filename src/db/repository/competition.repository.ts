import { BaseCommonRepository } from "../BaseCommonRepository";
import { EntityRepository, getCustomRepository, MoreThan } from "typeorm";
import { CompetitionEntity } from "../entity/competition.entity";
import { DirectionsRepository } from "./competition/directions.repository";
import { RegistrationRepository } from "./competition/registration.repository";
import { RegistrationEntity } from "../entity/competition/registration.entity";


@EntityRepository(CompetitionEntity)
export class CompetitionRepository extends BaseCommonRepository<CompetitionEntity> {

    public _entityIdentifier: string = "CompetitionEntity";

    public async InitDefaults(): Promise<void> {
    }

    public async getIfCompetitionExist(id: string): Promise<boolean> {
        let count: number = await this.repository.count({ id: id });
        return count > 0;
    }

    public async getCompetition(id: string): Promise<CompetitionEntity> {
        return this.repository.findOne(id);
    }

    public async deleteCompetition(id: string): Promise<void> {
        await this.repository.delete(id);
        return;
    }

    public async createCompetition(competition: CompetitionEntity): Promise<CompetitionEntity> {
        let comp: CompetitionEntity = await this.repository.save(competition);
        let tempReg: RegistrationEntity = new RegistrationEntity();
        tempReg.registrationOpen = new Date();
        tempReg.registrationClose = new Date();
        await getCustomRepository(RegistrationRepository).createRegistration(comp, tempReg);
        return comp;
    }

    public async editorUpdateCompetition(competition: CompetitionEntity): Promise<CompetitionEntity> {
        let old: CompetitionEntity = await this.repository.findOne(competition.id);
        competition.isHidden = old.isHidden;
        competition.isOfficial = old.isOfficial;
        return this.repository.save(competition);
    }

    public async announcerUpdateCompetition(competition: CompetitionEntity): Promise<CompetitionEntity> {
        return this.repository.save(competition);
    }

    public async getOfficialCompetitions(): Promise<CompetitionEntity[]> {
        return this.repository.find({
            select: ['id', 'name', 'country', 'city', 'startDate', 'endDate', 'location', 'address'],
            order: { 'startDate': 'ASC' }, where: { 'isOfficial': true, 'isHidden': false }
        });
    }
}
