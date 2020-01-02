import { autoserialize, autoserializeAs } from 'cerialize'

export class AssociationDocumentModel {

    @autoserialize
    public id: number;

    @autoserialize
    public title: string;

    @autoserialize
    public path: string;

    @autoserialize
    public type: number;

    @autoserializeAs(Date)
    public updateDate: Date;

    @autoserializeAs(Date)
    public creationDate: Date;
}