import { autoserialize } from "cerialize";

/**
 *
 *
 * @export
 * @class FAQCategoryModel
 */
export class FAQCategoryModel {


    /**
     * Category unique ID
     *
     * @type {string}
     * @memberof FAQCategoryModel
     */
    @autoserialize id: string;


    /**
     * Category name
     *
     * @type {string}
     * @memberof FAQCategoryModel
     */
    @autoserialize name: string;


    @autoserialize weight: number;

}