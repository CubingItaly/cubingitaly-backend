import { autoserialize, autoserializeAs } from 'cerialize';
import { TravelMeanModel } from './travelmean.model';

export class DirectionsModel {

    @autoserialize
    public id: number;

    @autoserializeAs(TravelMeanModel)
    public mean: TravelMeanModel;

    @autoserialize
    public directions: string;

}