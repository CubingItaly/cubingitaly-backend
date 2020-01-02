import { ITransformable } from "../transformable";
import { Column, BaseEntity, ManyToMany, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { AssociationDocumentModel } from "../../models/classes/association-document.model";

@Entity()
export class AssociationDocumentEntity extends BaseEntity implements ITransformable<AssociationDocumentModel>{

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ unique: true, nullable: false })
    public title_low: string;

    @Column({ nullable: false, length: 100 })
    public title: string;

    @Column({ nullable: false, length: 150 })
    public path: string;

    @Column({ nullable: false, default: 2 })
    public type: number;

    @UpdateDateColumn()
    public updateDate: Date;

    @CreateDateColumn()
    public creationDate: Date;

    _assimilate(origin: AssociationDocumentModel): void {
        this.id = origin.id;
        this.title = origin.title;
        this.type = origin.type;
        this.path = origin.path;
        this.title_low = this.getTitleLow(origin.title);
    }

    private getTitleLow(title: string): string {
        title = title.toLowerCase();
        title = title.replace(/[ ]/g, "_");
        title = title.replace(/[\-\\\/\.]/g, "");
        title = title.replace(/\à/g, "a");
        title = title.replace(/\è/g, "e");
        title = title.replace(/\é/g, "e");
        title = title.replace(/\ì/g, "i");
        title = title.replace(/\ò/g, "o");
        title = title.replace(/\ù/g, "u");
        return title;
    }


    _transform(): AssociationDocumentModel {
        let out: AssociationDocumentModel = new AssociationDocumentModel();
        out.id = this.id;
        out.path = this.path;
        out.title = this.title;
        out.type = this.type;
        out.creationDate = this.creationDate;
        out.updateDate = this.updateDate;
        return out;
    }
}