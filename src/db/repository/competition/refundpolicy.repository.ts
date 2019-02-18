import { BaseCommonRepository } from "../../BaseCommonRepository";
import { EntityRepository } from "typeorm";
import { RefundPolicyEntity } from "../../entity/competition/refundpolicy.entity";
import { RegistrationEntity } from "../../entity/competition/registration.entity";


@EntityRepository(RefundPolicyEntity)
export class RefundPolicyRepository extends BaseCommonRepository<RefundPolicyEntity> {

    public _entityIdentifier: string = "RefundPolicyEntity";

    public async InitDefaults(): Promise<void> {
    }

    public async getRefundPolicies(registration: RegistrationEntity): Promise<RefundPolicyEntity[]> {
        return this.repository.find({ registration: registration });
    }

    public async getRefundPolicy(id: number): Promise<RefundPolicyEntity> {
        return this.repository.findOne(id);
    }

}