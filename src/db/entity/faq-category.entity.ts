import { ITransformable } from "../transformable";
import { Column, BaseEntity, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { FAQCategoryModel } from "../../models/classes/faq-category.model";
import { FAQEntity } from './faq.entity';


@Entity()
export class FAQCategoryEntity extends BaseEntity implements ITransformable<FAQCategoryModel>{

    @PrimaryGeneratedColumn()
    public id: string;

    @Column({ nullable: false, length: 70 })
    public name: string;

    @Column({ nullable: false })
    public weight: number;

    @OneToMany(type => FAQEntity, faq => faq.category)
    public faq: FAQEntity[]

    _assimilate(origin: FAQCategoryModel): void {
        this.id = origin.id || null;
        this.name = origin.name;
        this.weight = origin.weight;
    }

    _transform(): FAQCategoryModel {
        let category: FAQCategoryModel = new FAQCategoryModel();
        category.id = this.id;
        category.name = this.name;
        category.weight = this.weight;
        return category;
    }
}