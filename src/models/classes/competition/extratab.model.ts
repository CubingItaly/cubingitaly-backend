import { autoserialize } from "cerialize";

export class ExtraTabModel {

    @autoserialize
    public id: number;

    @autoserialize
    public name: String;

    @autoserialize
    public content: String;

    @autoserialize
    public index: number;

}