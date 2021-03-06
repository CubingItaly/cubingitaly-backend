import { BaseCommonRepository } from "../../BaseCommonRepository";
import { EntityRepository, Table } from "typeorm";
import { ExtraTabEntity } from "../../entity/competition/extratab.entity";
import { CompetitionEntity } from "../../entity/competition.entity";


@EntityRepository(ExtraTabEntity)
export class ExtraTabRepository extends BaseCommonRepository<ExtraTabEntity> {


    public _entityIdentifier: string = "ExtraTabEntity";

    public async InitDefaults(): Promise<void> {
    }

    public async getTabById(id: number): Promise<ExtraTabEntity> {
        return this.repository.findOne(id);
    }

    public async getTabsByCompetition(competition: CompetitionEntity): Promise<ExtraTabEntity[]> {
        return this.repository.find({ where: { competition: competition }, order: { "indexInComp": "ASC" } });
    }

    private async countTabByCompetition(competition: CompetitionEntity): Promise<number> {
        return this.repository.count({ competition: competition });
    }

    public async addTabToCompetition(competition: CompetitionEntity, tab: ExtraTabEntity): Promise<ExtraTabEntity> {
        tab.competition = competition;
        tab.indexInComp = await this.countTabByCompetition(competition);
        return this.repository.save(tab);
    }

    public async updateTab(tab: ExtraTabEntity): Promise<ExtraTabEntity> {
        let old: ExtraTabEntity = await this.repository.findOne(tab.id);
        old.name = tab.name;
        old.content = tab.content;
        return this.repository.save(old);
    }

    public async moveTab(tab: number, competition: CompetitionEntity, delta: number): Promise<ExtraTabEntity[]> {
        let tabs: ExtraTabEntity[] = await this.getTabsByCompetition(competition);
        let index: number = tabs.findIndex((t: ExtraTabEntity) => t.id === Number(tab));
        let newIndex = index + delta;
        this.moveElement(index, newIndex, tabs);
        this.assignIndexes(tabs);
        return this.repository.save(tabs);
    }

    public moveElement(index: number, newIndex: number, tabs: ExtraTabEntity[]) {
        if (newIndex > tabs.length) {
            newIndex = tabs.length - 1;
        }
        tabs.splice(newIndex, 0, tabs.splice(index, 1)[0]);
        return tabs;
    }

    private sortTabs(tabs: ExtraTabEntity[]) {
        if (tabs && tabs.length > 0) {
            return tabs.sort((a: ExtraTabEntity, b: ExtraTabEntity) => {
                if (a.indexInComp > b.indexInComp) return 1;
                if (a.indexInComp < b.indexInComp) return -1;
                return 0;
            });
        }
        return [];
    }

    public async deleteTab(tab: number, competition: CompetitionEntity): Promise<void> {
        await this.repository.delete(tab);
        let tabs: ExtraTabEntity[] = await this.getTabsByCompetition(competition);
        this.assignIndexes(tabs);
        await this.repository.save(tabs);
        return;
    }

    private assignIndexes(tabs: ExtraTabEntity[]) {
        for (let i = 0; i < tabs.length; i++) {
            tabs[i].indexInComp = i;
        }
        return tabs;
    }
}
