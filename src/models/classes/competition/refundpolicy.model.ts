import { autoserialize } from 'cerialize';

export class RefundPolicyModel {

    @autoserialize
    public id: number;

    @autoserialize
    public percentage: number;

    @autoserialize
    public deadline: Date;

}