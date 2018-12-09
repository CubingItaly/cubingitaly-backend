import 'mocha';
import { assert } from 'chai';
import { ArticleEntity } from '../../src/db/entity/article.entity';
import { ArticleModel } from '../../src/models/classes/article.model';
import { UserEntity } from '../../src/db/entity/user.entity';
import { ArticleCategoryEntity } from '../../src/db/entity/category.entity';
import { UserModel } from '../../src/models/classes/user.model';
import { ArticleCategoryModel } from '../../src/models/classes/category.model';

describe('It test the transform function of the entity', () => {

    let entity: ArticleEntity;

    beforeEach(() => {
        entity = new ArticleEntity();
        entity.id = "test";
        entity.title = "title";
        entity.summary = "test summary";
        entity.isPublic = false;
        entity.content = "fake content";
        entity.updateDate = new Date();
        entity.publishDate = new Date();
    });

    it('Test with no categories, no author, no editor and not public', () => {
        let model: ArticleModel = entity._transform();

        assert.equal(entity.id, model.id);
        assert.equal(entity.title, model.title);
        assert.equal(entity.summary, model.summary);
        assert.equal(entity.isPublic, model.isPublic);
        assert.equal(entity.content, model.content);
        assert.equal(undefined, model.author);
        assert.equal(undefined, model.lastEditor);
        assert.equal(0, model.categories.length);
        assert.equal(entity.updateDate, model.updateDate);
        assert.equal(entity.publishDate, model.publishDate);
    });

    it('Test with author and editor', () => {
        let user: UserEntity = new UserEntity();
        user.id = 1;

        entity.author = user;

        user = new UserEntity();
        user.id = 2;

        entity.lastEditor = user;

        let model: ArticleModel = entity._transform();

        assert.equal(1, model.author.id);
        assert.equal(2, model.lastEditor.id);
    });

    it('Test with categories', () => {
        let categories: ArticleCategoryEntity[] = [];
        categories[0] = new ArticleCategoryEntity();
        categories[0].id = "cat1";
        categories[1] = new ArticleCategoryEntity();
        categories[1].id = "cat2";

        entity.categories = categories;

        let model: ArticleModel = entity._transform();

        assert.equal(model.categories.length, 2);
        assert.equal(model.categories[1].id, "cat2");
    });
});

describe('Test the assimilate function', () => {

    let source: ArticleModel;

    beforeEach(() => {
        source = new ArticleModel();
        source.id = "test";
        source.title = "title";
        source.summary = "test summary";
        source.isPublic = false;
        source.content = "fake content";
        source.updateDate = new Date();
        source.publishDate = new Date();
    });

    it('Test a model without categories, author and editor', () => {
        let entity: ArticleEntity = new ArticleEntity();
        entity._assimilate(source);

        assert.equal(entity.id, source.id);
        assert.equal(entity.title, source.title);
        assert.equal(entity.summary, source.summary);
        assert.equal(entity.isPublic, source.isPublic);
        assert.equal(entity.content, source.content);
        assert.equal(undefined, source.author);
        assert.equal(undefined, source.lastEditor);
        assert.equal(0, source.categories.length);
        assert.equal(entity.updateDate, source.updateDate);
        assert.equal(entity.publishDate, source.publishDate);
    });

    it('Test a model with author and editor', () => {
        let user: UserModel = new UserModel();
        user.id = 1;

        source.author = user;

        user = new UserModel();
        user.id = 2;

        source.lastEditor = user;

        let entity: ArticleEntity = new ArticleEntity();
        entity._assimilate(source);

        assert.equal(1, entity.author.id);
        assert.equal(2, entity.lastEditor.id);
    });

    it('Test with categories', () => {
        let categories: ArticleCategoryModel[] = [];
        categories[0] = new ArticleCategoryModel();
        categories[0].id = "cat1";
        categories[1] = new ArticleCategoryModel();
        categories[1].id = "cat2";

        source.categories = categories;

        let entity: ArticleEntity = new ArticleEntity();
        entity._assimilate(source);

        assert.equal(entity.categories.length, 2);
        assert.equal(entity.categories[1].id, "cat2");
    });
});