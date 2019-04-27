import { autoserialize } from 'cerialize';

export class PaymentMeanModel {

    @autoserialize
    public id: string;

    @autoserialize
    public name: string;

    @autoserialize
    public details: string;

}