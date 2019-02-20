import { BaseCommonRepository } from "./BaseCommonRepository";
import { getCustomRepository } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import { TeamRepository } from "./repository/team.repository";
import { ArticleCategoryRepository } from "./repository/category.repository";
import { UserRepository } from "./repository/user.repository";
import { RoleRepository } from "./repository/role.repository";
import { ArticleRepository } from "./repository/article.repository";
import { PageRepository } from "./repository/page.repository";
import { TutorialRepository } from "./repository/tutorial.repository";
import { FAQRepository } from "./repository/faq.repository";
import { FAQCategoryRepository } from './repository/faq-category.repository';
import { EventRepository } from './repository/competition/event.repository';
import { TravelMeanRepository } from './repository/competition/travelmean.repository';
import { PaymentMeanRepository } from './repository/competition/paymentmean.repository';
import { DirectionsRepository } from "./repository/competition/directions.repository";
import { CompetitionRepository } from "./repository/competition.repository";
//import { DirectionsRepository } from './repository/competition/directions.repository';

/**
 * Holds all the custom repository that needs to run a custom function check when the database connection is available (init).
 * 
 * @export
 * @returns {BaseCommonRepository<BaseEntity>[]} 
 */
export function _BOOTSTRAPS(): BaseCommonRepository<BaseEntity>[] {
  return [
    getCustomRepository(UserRepository),
    getCustomRepository(TeamRepository),
    getCustomRepository(ArticleCategoryRepository),
    getCustomRepository(RoleRepository),
    getCustomRepository(ArticleRepository),
    getCustomRepository(PageRepository),
    getCustomRepository(TutorialRepository),
    getCustomRepository(FAQCategoryRepository),
    getCustomRepository(FAQRepository),
    getCustomRepository(EventRepository),
    getCustomRepository(TravelMeanRepository),
    getCustomRepository(PaymentMeanRepository),
    getCustomRepository(CompetitionRepository),
    getCustomRepository(DirectionsRepository)
  ];
}