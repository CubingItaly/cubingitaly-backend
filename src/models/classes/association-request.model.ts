import { autoserialize } from 'cerialize';

export class AssociationRequest {

    @autoserialize
    public name: string;

    @autoserialize
    public surname: string;

    @autoserialize
    public birthplace: string;

    @autoserialize
    public birthdate: string;

    @autoserialize
    public fiscalCode: string;

    @autoserialize
    public city: string;

    @autoserialize
    public street: string;

    @autoserialize
    public num: string;

    @autoserialize
    public country: string;

    @autoserialize
    public email: string;

    @autoserialize
    public assLevel: string;
}