import { BaseCommonRepository } from "../../BaseCommonRepository";
import { EntityRepository, Table } from "typeorm";
import { ExtraTabEntity } from "../../entity/competition/extratab.entity";
import { CompetitionEntity } from "../../entity/competition.entity";


@EntityRepository(ExtraTabEntity)
export class ExtraTabRepository extends BaseCommonRepository<ExtraTabEntity> {


    public _entityIdentifier: string = "ExtraTabEntity";

    public async InitDefaults(): Promise<void> {
    }


    public async getTabsByCompetition(competition: CompetitionEntity): Promise<ExtraTabEntity[]> {
        return this.repository.find({ where: { competition: competition }, order: { "index": "ASC" } });
    }

    private async countTabByCompetition(competition: CompetitionEntity): Promise<number> {
        return this.repository.count({ competition: competition });
    }

    public async addTabToCompetition(competition: CompetitionEntity, tab: ExtraTabEntity): Promise<ExtraTabEntity> {
        tab.competition = competition;
        tab.index = await this.countTabByCompetition(competition);
        return this.repository.save(tab);
    }

    public async updateTab(tab: ExtraTabEntity): Promise<ExtraTabEntity> {
        let old: ExtraTabEntity = await this.repository.findOne(tab.id);
        old.name = tab.name;
        old.content = tab.content;
        return this.repository.save(old);
    }

    public async moveTab(tab: ExtraTabEntity, competition: CompetitionEntity, delta: number): Promise<ExtraTabEntity[]> {
        let tabs: ExtraTabEntity[] = await this.getTabsByCompetition(competition);
        tabs = this.sortTabs(tabs);
        tabs = this.moveElement(tab.index, delta, tabs);
        return this.repository.save(tabs);
    }

    private sortTabs(tabs: ExtraTabEntity[]) {
        if (tabs && tabs.length > 0) {
            return tabs.sort((a: ExtraTabEntity, b: ExtraTabEntity) => {
                if (a.index > b.index) return 1;
                if (a.index < b.index) return -1;
                return 0;
            });
        }
        return [];
    }

    private moveElement(index: number, delta: number, tabs: ExtraTabEntity[]) {
        let newIndex: number = index + delta;
        if (delta < 0) {
            newIndex = 0;
            delta = newIndex - index;
        } else if (newIndex >= tabs.length) {
            newIndex = tabs.length - 1;
            delta = newIndex - index;
        }

        tabs[index].index = newIndex;

        if (delta < 0) {
            for (let i = newIndex; i < index; i++) {
                tabs[i].index++;
            }
        } else if (delta > 0) {
            for (let i = index + 1; i <= newIndex; i++) {
                tabs[i].index--;
            }
        }
        return this.sortTabs(tabs);
    }

    public async deleteTab(tab: number, competition: CompetitionEntity): Promise<void> {
        let tabs: ExtraTabEntity[] = await this.getTabsByCompetition(competition);
        this.repository.delete(tab);
        tabs = tabs.filter((t: ExtraTabEntity) => t.id !== tab);
        tabs = this.sortTabs(tabs);
        tabs = this.assignIndexes(tabs);
        this.repository.save(tabs);
        return;
    }

    private assignIndexes(tabs: ExtraTabEntity[]) {
        for (let i = 0; i < tabs.length; i++) {
            tabs[i].index = i;
        }
        return tabs;
    }
}
