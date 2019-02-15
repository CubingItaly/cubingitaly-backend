import { BaseCommonRepository } from "../BaseCommonRepository";
import { EntityRepository } from "typeorm";
import { FAQCategoryEntity } from "../entity/faq-category.entity";


@EntityRepository(FAQCategoryEntity)
export class FAQCategoryRepository extends BaseCommonRepository<FAQCategoryEntity> {

    private categories: { weight: number, name: string }[] = [
        {
            weight: 1,
            name: "Iscrizione alle competizioni"
        },
        {
            weight: 2,
            name: "Svolgimento delle competizioni"
        },
        {
            weight: 3,
            name: "Concetti importanti"
        },
    ];

    public _entityIdentifier: string = "FAQCategoryEntity";


    public async InitDefaults(): Promise<void> {
        let count: number = await this.repository.count();
        if (count === 0) {
            for (const c of this.categories) {
                let category: FAQCategoryEntity = new FAQCategoryEntity();
                category.weight = c.weight;
                category.name = c.name;
                await this.repository.save(category);
            }
        }
        return;
    }


    public async getCategories(): Promise<FAQCategoryEntity[]> {
        return this.repository.find({ order: { weight: "ASC" } });
    }

}