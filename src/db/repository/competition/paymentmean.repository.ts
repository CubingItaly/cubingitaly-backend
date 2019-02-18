import { BaseCommonRepository } from "../../BaseCommonRepository";
import { EntityRepository } from "typeorm";
import { PaymentMeanEntity } from "../../entity/competition/paymentmean.entity";


@EntityRepository(PaymentMeanEntity)
export class PaymentMeanRepository extends BaseCommonRepository<PaymentMeanEntity> {

    private meansId: string[] = ["cc", "paypal", "cash"];
    private meansName: string[] = ["Carta di credito", "PayPal", "Contanti"];
    private meansDetails: string[] = ["", "", ""];

    public _entityIdentifier: string = "PaymentMeanEntity";

    public async InitDefaults(): Promise<void> {
        let events: PaymentMeanEntity[] = [];
        for (let i = 0; i < this.meansId.length; i++) {
            let temp = new PaymentMeanEntity();
            temp.id = this.meansId[i];
            temp.name = this.meansName[i];
            temp.details = this.meansDetails[i];
            events.push(temp);
        }
        for (let event of events) {
            let exist = await this.getIfMeanExists(event.id);
            if (!exist) {
                await this.repository.save(event);
            }
        }
    }

    private async getIfMeanExists(id: string) {
        let count: number = await this.repository.count({ id: id });
        return count > 0;
    }

    public async getPaymentMeans(): Promise<PaymentMeanEntity[]> {
        return this.repository.find();
    }

    public async getPaymentMean(id: string): Promise<PaymentMeanEntity> {
        return this.repository.findOne(id);
    }

}