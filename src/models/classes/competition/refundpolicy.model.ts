import { autoserialize, autoserializeAs } from 'cerialize';

export class RefundPolicyModel {

    @autoserialize
    public id: number;

    @autoserialize
    public percentage: number;

    @autoserializeAs(Date)
    public deadline: Date;

}