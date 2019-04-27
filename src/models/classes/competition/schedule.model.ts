import { autoserialize, autoserializeAs } from 'cerialize';
import { ScheduleRowModel } from './schedule.row.model';

export class ScheduleModel {

    @autoserialize
    public id: number;

    @autoserializeAs(Date)
    public day: Date;

    @autoserialize
    public dayIndex: number;

    @autoserializeAs(ScheduleRowModel)
    public rows: ScheduleRowModel[];

}