import { BaseCommonRepository } from "../BaseCommonRepository";
import { EntityRepository, getCustomRepository, MoreThan, LessThanOrEqual, MoreThanOrEqual, LessThan, } from "typeorm";
import { CompetitionEntity } from "../entity/competition.entity";
import { RegistrationRepository } from "./competition/registration.repository";
import { RegistrationEntity } from "../entity/competition/registration.entity";
import { UserEntity } from "../entity/user.entity";
import { ArticleRepository } from "./article.repository";


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
        let regRepo: RegistrationRepository = getCustomRepository(RegistrationRepository);
        let reg: RegistrationEntity = await regRepo.getRegistrationByCompetition(competition);
        if (reg.isComplete) {
            let comp = await this.repository.save(competition);
            if (comp.isOfficial && !comp.isHidden && !comp.articlePublished) {
                this.postArticleAnnounce(comp);
                comp.articlePublished = true;
                return this.repository.save(comp);
            } else {
                return comp;
            }
        }
        else {
            throw new Error("Registration is not complete");
        }
    }

    private async postArticleAnnounce(comp: CompetitionEntity): Promise<void> {
        getCustomRepository(ArticleRepository).postCompetitionArticle(comp);
    }

    public async getOfficialCompetitions(): Promise<CompetitionEntity[]> {
        return this.repository.find({
            select: ['id', 'name', 'country', 'city', 'startDate', 'endDate', 'location', 'address', 'isMultiLocation'],
            order: { 'startDate': 'ASC' }, where: { 'isOfficial': true, 'isHidden': false }
        });
    }

    public async getUpcomingCompetitions(date: Date): Promise<CompetitionEntity[]> {
        return this.repository.find({
            select: ['id', 'name', 'country', 'city', 'startDate', 'endDate', 'location', 'address', 'isMultiLocation'],
            order: { 'startDate': 'ASC', endDate: 'ASC' }, where: { 'isOfficial': true, 'isHidden': false, 'startDate': MoreThan(date) }
        });
    }

    public async getOnGoingCompetitions(date: Date): Promise<CompetitionEntity[]> {
        return this.repository.find({
            select: ['id', 'name', 'country', 'city', 'startDate', 'endDate', 'location', 'address', 'isMultiLocation'],
            order: { 'startDate': 'ASC', endDate: 'ASC' }, where: { 'isOfficial': true, 'isHidden': false, 'startDate': LessThanOrEqual(date), 'endDate': MoreThanOrEqual(date) }
        });
    }

    public async getPastCompetitions(date: Date): Promise<CompetitionEntity[]> {
        return this.repository.find({
            select: ['id', 'name', 'country', 'city', 'startDate', 'endDate', 'location', 'address', 'isMultiLocation'],
            order: { 'startDate': 'DESC', 'endDate': 'DESC' }, where: { 'isOfficial': true, 'isHidden': false, 'endDate': LessThan(date) }
        });
    }

    public async getMyCompetitions(user: UserEntity): Promise<CompetitionEntity[]> {
        return this.repository.createQueryBuilder("comp")
            .select(['comp.id', 'comp.name', 'comp.country', 'comp.city', 'comp.startDate', 'comp.endDate', 'comp.location', 'comp.address', 'comp.isMultiLocation'])
            .innerJoin("comp.organizers", "orga")
            .innerJoin("comp.delegates", "deleg")
            .where("orga.id = :id", { id: user.id })
            .orWhere("deleg.id = :id", { id: user.id })
            .orderBy("comp.startDate", "DESC")
            .addOrderBy("comp.endDate", "DESC")
            .getMany();
    }

    public async getAdminCompetitions(): Promise<CompetitionEntity[]> {
        return this.repository.find({
            select: ['id', 'name', 'country', 'city', 'startDate', 'endDate', 'location', 'address', 'isMultiLocation'],
            order: { 'startDate': 'DESC', 'endDate': 'DESC' }
        });
    }

    public async updateDate(id: string): Promise<void> {
        let competition: CompetitionEntity = await this.repository.findOne(id);
        if (competition) {
            competition.updateDate = new Date();
            await this.repository.save(competition);
        }
        return;
    }
}
