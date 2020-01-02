import { BaseCommonRepository } from "../BaseCommonRepository";
import { EntityRepository, Not } from "typeorm"; import { AssociationDocumentEntity } from "../entity/association.entity";


@EntityRepository(AssociationDocumentEntity)
export class AssociationDocumentRepository extends BaseCommonRepository<AssociationDocumentEntity> {


    public _entityIdentifier: string = "AssociationDocumentEntity";

    public async InitDefaults(): Promise<void> {
        return;
    }

    public async getDocument(id: number): Promise<AssociationDocumentEntity> {
        return this.repository.findOne(id);
    }

    public async idExists(id: number): Promise<boolean> {
        let docs: AssociationDocumentEntity[] = await this.repository.find({ id: id });
        return docs.length !== 0;
    }

    public async getTitleExists(title: string, id: number): Promise<boolean> {
        let docs: AssociationDocumentEntity[] = await this.repository.find({ id: Not(id), title_low: title });
        return docs.length !== 0;
    }

    public async createDoc(doc: AssociationDocumentEntity): Promise<AssociationDocumentEntity> {
        return this.repository.save(doc);
    }

    public async updateDoc(id: number, title: string, title_low: string, path: string, type: number): Promise<AssociationDocumentEntity> {
        let doc: AssociationDocumentEntity = await this.repository.findOne(id);
        doc.title = title;
        doc.title_low = title_low;
        doc.path = path;
        doc.type = type;
        return this.repository.save(doc);
    }

    public async deleteDoc(id: number): Promise<void> {
        this.repository.delete({ id: id });
    }

    public async getDocuments(): Promise<AssociationDocumentEntity[]> {
        return this.repository.find();
    }

}