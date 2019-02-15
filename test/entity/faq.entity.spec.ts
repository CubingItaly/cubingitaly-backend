import 'mocha';
import { assert } from 'chai';
import { FAQEntity } from '../../src/db/entity/faq.entity';
import { FAQCategoryEntity } from '../../src/db/entity/faq-category.entity';
import { FAQModel } from '../../src/models/classes/faq.model';
import { FAQCategoryModel } from '../../src/models/classes/faq-category.model';

describe('It test the transform function of the faq entity', () => {

    let faq: FAQEntity;
    before(() => {
        faq = new FAQEntity();
        faq.id = 1;
        faq.title = "Test FAQ";
        faq.content = "Test COntent";
        faq.category = new FAQCategoryEntity();
        faq.category.name = "Category 1";
        faq.category.id = "cat1";
        faq.category.weight = 2;
    });

    it('test the transform function', () => {
        let model: FAQModel = faq._transform();
        assert.equal(model.id, faq.id);
        assert.equal(model.title, faq.title);
        assert.equal(model.editor, null);
        assert.equal(model.content, faq.content);
        assert.equal(model.category.id, faq.category.id);
        assert.equal(model.category.name, faq.category.name);
        assert.equal(model.category.weight, faq.category.weight);
    });

    it('test the transform function for a faq without category', () => {
        faq.category = null;
        let model: FAQModel = faq._transform();
        assert.equal(model.id, faq.id);
        assert.equal(model.title, faq.title);
        assert.equal(model.editor, null);
        assert.equal(model.content, faq.content);
        assert.equal(model.category, null);
    });

});

describe('It test the assimilate function of the faq entity', () => {

    let faq: FAQModel;
    before(() => {
        faq = new FAQModel();
        faq.id = 1;
        faq.title = "Test FAQ";
        faq.content = "Test COntent";
        faq.category = new FAQCategoryModel();
        faq.category.name = "Category 1";
        faq.category.id = "cat1";
        faq.category.weight = 2;
    });

    it('test the assimilate function', () => {
        let entity: FAQEntity = new FAQEntity();
        entity._assimilate(faq);
        assert.equal(entity.id, faq.id);
        assert.equal(entity.title, faq.title);
        assert.equal(entity.editor, null);
        assert.equal(entity.content, faq.content);
        assert.equal(entity.category.id, faq.category.id);
        assert.equal(entity.category.name, faq.category.name);
        assert.equal(entity.category.weight, faq.category.weight);
    });

    it('test the assimilate function for a faq without category', () => {
        faq.category = null;
        let entity: FAQEntity = new FAQEntity();
        entity._assimilate(faq);
        assert.equal(entity.id, faq.id);
        assert.equal(entity.title, faq.title);
        assert.equal(entity.editor, null);
        assert.equal(entity.content, faq.content);
        assert.equal(entity.category, null);
    });

    it('test the assimilate function for a faq without id', () => {
        faq.category = null;
        faq.id=null;
        let entity: FAQEntity = new FAQEntity();
        entity._assimilate(faq);
        assert.equal(entity.id, null);
        assert.equal(entity.title, faq.title);
        assert.equal(entity.editor, null);
        assert.equal(entity.content, faq.content);
        assert.equal(entity.category, null);
    });


});