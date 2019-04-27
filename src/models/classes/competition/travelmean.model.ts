import { autoserialize } from 'cerialize';

export class TravelMeanModel {

    @autoserialize
    public id: number;

    @autoserialize
    public name: string;

}