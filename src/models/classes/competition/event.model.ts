import { autoserialize } from 'cerialize';

export class EventModel {

    @autoserialize
    public id: string;

    @autoserialize
    public name: string;

    @autoserialize
    public weight: number;

}