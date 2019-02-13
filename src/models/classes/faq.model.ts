import { autoserialize, autoserializeAs } from 'cerialize';
import { UserModel } from './user.model';
import { FAQCategoryModel } from './faq-category.model';

export class FAQModel {

    @autoserialize
    public id: number;

    @autoserialize
    public title: string;

    @autoserialize
    public content: string;

    @autoserializeAs(UserModel)
    public editor: UserModel;

    @autoserializeAs(FAQCategoryModel)
    public category: FAQCategoryModel;
    
}