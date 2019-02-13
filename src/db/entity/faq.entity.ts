import { ITransformable } from "../transformable";
import { FAQModel } from "../../models/classes/faq.model";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import { UserEntity } from './user.entity';
import { FAQCategoryEntity } from './faq-category.entity';

@Entity()
export class FAQEntity extends BaseEntity implements ITransformable<FAQModel> {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false, length: 120 })
    public title: string;

    @Column({ type: "text", nullable: false })
    public content: string;

    @UpdateDateColumn()
    private updateDate: Date;

    @ManyToOne(type => UserEntity, user => user.editedFAQs, { nullable: true })
    public editor: UserEntity;

    @ManyToOne(type => FAQCategoryEntity, category => category.faq.map, { nullable: true })
    public category: FAQCategoryEntity;

    _assimilate(origin: FAQModel) {
        this.id = origin.id || null;
        this.title = origin.title;
        this.content = origin.content;
        if (origin.category) {
            this.category = new FAQCategoryEntity();
            this.category._assimilate(origin.category)
        }
    }

    _transform(): FAQModel {
        let faq: FAQModel = new FAQModel();
        faq.id = this.id;
        faq.title = this.title;
        faq.content = this.content;
        if (this.category) {
            faq.category = this.category._transform();
        }
        return faq;
    }
}