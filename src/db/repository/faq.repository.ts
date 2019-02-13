import { BaseCommonRepository } from "../BaseCommonRepository";
import { EntityRepository } from "typeorm";
import { FAQEntity } from "../entity/faq.entity";
import { UserEntity } from "../entity/user.entity";


@EntityRepository(FAQEntity)
export class FAQRepository extends BaseCommonRepository<FAQEntity> {

    public _entityIdentifier: string = "FAQEntity";


    public async InitDefaults(): Promise<void> {
    }


    public async getFAQs(category: string): Promise<FAQEntity[]> {
        if (category) {
            return this.repository.createQueryBuilder("faq")
                .innerJoin("faq.category", "category")
                .where("category.id = :id", { id: category })
                .orderBy("faq.title", "ASC")
                .getMany();
        } else {
            return this.repository.find({ order: { title: "ASC" } });
        }
    }

    public async getFAQ(id: number): Promise<FAQEntity> {
        return this.repository.findOne(id, { relations: ['category'] });
    }

    public async createFAQ(faq: FAQEntity, editor: UserEntity): Promise<FAQEntity> {
        faq.editor = editor;
        return this.repository.save(faq);
    }

    public async updateFAQ(faq: FAQEntity, editor: UserEntity): Promise<FAQEntity> {
        let old = await this.getFAQ(faq.id);
        if (old) {
            if (old.title !== faq.title || old.content !== faq.content || old.category !== faq.category) {
                faq.editor = editor;
                faq = await this.repository.save(faq);
            }
        } else {
            return;
        }
        return faq;
    }

    public async deleteFAQ(id: number): Promise<void> {
        let faq: FAQEntity = await this.getFAQ(id);
        await this.repository.remove(faq);
        return;
    }

}