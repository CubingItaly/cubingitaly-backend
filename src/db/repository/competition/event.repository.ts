import { BaseCommonRepository } from "../../BaseCommonRepository";
import { EntityRepository } from "typeorm";
import { EventEntity } from "../../entity/competition/event.entity";


@EntityRepository(EventEntity)
export class EventRepository extends BaseCommonRepository<EventEntity> {

    private eventId: string[] = ["333", "222", "444", "555", "666", "777", "333bf", "333fm", "333oh", "clock", "minx", "pyram", "skewb", "sq1", "444bf", "555bf", "333mbf"];
    private eventName: string[] = ["Cubo 3x3x3", "Cubo 2x2x2", "Cubo 4x4x4", "Cubo 5x5x5", "Cubo 6x6x6", "Cubo 7x7x7", "3x3 Blindfolded", "3x3 Fewest Moves", "3x3 One Handed", "Clock", "Megaminx", "Pyraminx", "Skewb", "Square-1", "4x4 Blindfolded", "5x5 Blindfolded", "3x3 Multi-Blind"]
    private eventWeight: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18];

    public _entityIdentifier: string = "EventEntity";

    public async InitDefaults(): Promise<void> {
        let events: EventEntity[] = [];
        for (let i = 0; i < this.eventId.length; i++) {
            let temp = new EventEntity();
            temp.id = this.eventId[i];
            temp.name = this.eventName[i];
            temp.weight = this.eventWeight[i];
            events.push(temp);
        }
        for (let event of events) {
            let exist = await this.getIfEventExists(event.id);
            if (!exist) {
                await this.repository.save(event);
            }
        }
    }

    public async getIfEventExists(id: string): Promise<boolean> {
        let count: number = await this.repository.count({ id: id });
        return count > 0;
    }

    public async getEvent(id: string): Promise<EventEntity> {
        return this.repository.findOne(id);
    }

    public async getEvents(): Promise<EventEntity[]> {
        return this.repository.find({ order: { weight: "ASC" } });
    }
}
