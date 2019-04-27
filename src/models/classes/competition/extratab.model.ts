import { autoserialize } from "cerialize";

export class ExtraTabModel {

    @autoserialize
    public id: number;

    @autoserialize
    public name: string;

    @autoserialize
    public content: string;

    @autoserialize
    public indexInComp: number;

}