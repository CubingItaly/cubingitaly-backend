import { assert, expect } from 'chai';
import 'mocha';
import { TestDatabase } from './___db';
import { PageRepository } from '../../src/db/repository/page.repository';
import { getCustomRepository, UpdateDateColumn } from 'typeorm';
import { PageEntity } from '../../src/db/entity/page.entity';
import { UserRepository } from '../../src/db/repository/user.repository';
import { UserEntity } from '../../src/db/entity/user.entity';
import { TutorialEntity } from '../../src/db/entity/tutorial.entity';
import { TutorialRepository } from '../../src/db/repository/tutorial.repository';

let db: TestDatabase;

let database: TestDatabase;
let repo: TutorialRepository;
let userRepo: UserRepository;
let user: UserEntity;
let user2: UserEntity;

describe('Test the tutorial repo', () => {
    let pageId: number;

    before(async () => {
        database = new TestDatabase();
        await database.createConnection();
        repo = getCustomRepository(TutorialRepository);
        userRepo = getCustomRepository(UserRepository);
        user = await userRepo.getUserById(397);
        user2 = await userRepo.getUserById(0);
    });

    it('Test the method to get public tutorials where there is no tutorial', async () => {
        let tutorials: TutorialEntity[] = await repo.getTutorials();
        assert.equal(0, tutorials.length);
    });


    it('Test the method to get admin tutorials where there is no tutorial', async () => {
        let tutorials: TutorialEntity[] = await repo.adminGetTutorials();
        assert.equal(0, tutorials.length);
    });


    it('Check if a tutorial exists when id doesn\'t', async () => {
        assert.equal(false, await repo.checkIfTutorialExists("test"));
    });

    it('Test the method to create a tutorial', async () => {
        let tutorial: TutorialEntity = await repo.createTutorial("Test", user);

        assert.equal(tutorial.id, "test");
        assert.equal(tutorial.title, "Test");
        assert.equal(tutorial.author.id, user.id);
        assert.equal(tutorial.lastEditor.id, user.id);
        assert.equal(tutorial.isPublic, false);
        assert.notEqual(undefined, tutorial.createDate);
        assert.notEqual(undefined, tutorial.updateDate);
        assert.equal(true, await repo.checkIfTutorialExists("test"));
        let tutorials: TutorialEntity[] = await repo.getTutorials();
        assert.equal(0, tutorials.length);
        tutorials = await repo.adminGetTutorials();
        assert.equal(1, tutorials.length);
        assert.equal("test", (await repo.getTutorial("test")).id);
    });

    it('Test the method to update a tutorial', async () => {
        let tutorial: TutorialEntity = await repo.getTutorial("test");
        tutorial.title = "New title";
        tutorial.isPublic = true;
        await repo.updateTutorial(tutorial, user2);
        tutorial = await repo.getTutorial("test");
        assert.equal(tutorial.title, "New title");
        assert.equal(false, tutorial.isPublic);
    });

    it('Test the method to update a tutorial that exists', async () => {
        let tutorial: TutorialEntity = await repo.getTutorial("test");
        tutorial.title = "New title";
        tutorial.isPublic = true;
        await repo.adminUpdateTutorial(tutorial, user);
        tutorial = await repo.getTutorial("test");
        assert.equal(tutorial.title, "New title");
        assert.equal(true, tutorial.isPublic);

        tutorial = await repo.getTutorial("test");

        assert.equal(true, (await repo.adminUpdateTutorial(tutorial, user)).isPublic)
    });

    it('Test the method to add a page', async () => {
        let page: PageEntity = new PageEntity();
        page.title = "test page";
        page.content = "prova";

        let tutorial: TutorialEntity = await repo.addPage("test", page, user);
        assert.equal(tutorial.pages.length, 1);
        assert.equal(tutorial.pages[0].indexInTutorial, 0);
        assert.equal(tutorial.pages[0].isPublic, tutorial.isPublic);

        page = new PageEntity();
        page.title = "second page";
        tutorial = await repo.addPage("test", page, user2);
        assert.equal(tutorial.pages.length, 2);
        assert.equal(tutorial.pages[1].indexInTutorial, 1);
        assert.equal(tutorial.pages[1].content, "");
        assert.equal(tutorial.pages[1].title, "second page");
        pageId = tutorial.pages[1].id;
    });

    it('Test the method to move a page', async () => {
        let tutorial: TutorialEntity = await repo.movePage("test", pageId, -1, user);
        assert.equal(tutorial.pages[0].id, pageId);

        tutorial = await repo.movePage("test", pageId, 0, user);
        assert.equal(tutorial.pages[0].id, pageId);
        assert.equal(tutorial.pages[1].indexInTutorial, 1);


        tutorial = await repo.movePage("test", pageId, 1, user);
        assert.equal(tutorial.pages[1].id, pageId);

        tutorial = await repo.movePage("test", 899, 1, user);
        assert.equal(tutorial.pages[1].id, pageId);
        assert.equal(tutorial.pages.length, 2);

        tutorial = await repo.movePage("test", pageId, 900, user);
        assert.equal(tutorial.pages[1].id, pageId);
        assert.equal(tutorial.pages[0].id, 103);

        tutorial = await repo.movePage("test", pageId, -900, user);
        assert.equal(tutorial.pages[0].id, pageId);
        assert.equal(tutorial.pages[1].id, 103);

    });

    it('Test the method to remove a page', async () => {
        let tutorial: TutorialEntity = await repo.removePage("test", 21984, user);
        assert.equal(tutorial.pages.length, 2);

        tutorial = await repo.removePage("test", pageId, user);
        assert.equal(tutorial.pages.length, 1);
        assert.equal(tutorial.pages[0].indexInTutorial, 0);
    });


    it('Test the method to check if a page is in a tutorial', async () => {
        let isInTutorial: boolean = await repo.pageIsInTutorial("test", 103);
        assert.equal(true, isInTutorial);

        isInTutorial = await repo.pageIsInTutorial("test", 109);
        assert.equal(false, isInTutorial);

        isInTutorial = await repo.pageIsInTutorial("wrongid", 109);
    });

    it('Test the method to delete a tutorial', async () => {
        await repo.deleteTutorial("test");
        assert.equal(undefined, await repo.getTutorial("test"));

        let pageRepo: PageRepository = getCustomRepository(PageRepository);
        let pageExists: boolean = await pageRepo.checkIfPageExists(103);
        assert.equal(false, pageExists);
        pageExists = await pageRepo.checkIfPageExists(104);
        assert.equal(false, pageExists);
    });



    let titles: { title: string, id: string }[] = [
        { title: "èç     éù", id: "ec-eu" },
        { title: "The Game", id: "the-game" },
        { title: "----Tavoli è sedìè sono bellissìmissimi --- asd -- .", id: "tavoli-e-sedie-sono-bellissimissimi-asd" },
        { title: "  ....  àèìòù  ---  __ KeK        asd", id: "aeiou-kek-asd" },
        { title: "? Kamikàze ORTU; ", id: "kamikaze-ortu" },
        { title: "<< >> <<< >>>", id: "tutorial" },
        { title: "admin", id: "tutorial2" },
        { title: "    àDmìN ..  _ ", id: "tutorial3" },
        { title: "KeK---", id: "kek" },
        { title: "{+}", id: "tutorial4" },
        { title: "44 Gàttì ìn fìlà pér trè còl rèstò _ dì dùé", id: "44-gatti-in-fila-per-tre-col-resto-di-due" },
        { title: "Il colmo --- per una ___ -- __ -??== \"!!\"\"!\\ //&()=?^£%$&!\"£$\"£$ puttana? èssere tua màdre", id: "il-colmo-per-una-puttana-essere-tua-madre" },
        { title: "	tab				 and spacè			", id: "tab-and-space" },
        { title: "çi vediamo =========== dòpo", id: "ci-vediamo-dopo" },
        { title: "https://cubingitaly.org/", id: "httpscubingitalyorg" },
        { title: "www.cubingitaly.org", id: "wwwcubingitalyorg" },
        { title: "Sondaggio importante: meglio gareggiare di domenica o di martedì?", id: "sondaggio-importante-meglio-gareggiare-di-domenica-o-di-martedi" },
        { title: "{} Topolino |||\\!\"£$%&/()=?^*§_:;,.-<>		", id: "topolino" },
        { title: "$$$%!\"£ !\"£!\"£§ §* §**_:;", id: "tutorial5" },
        { title: "https://www.facebook.com/sergionep/posts/10212151071148751?comment_id=10212155057488407&comment_t2tn%22%3A%22,R%22%7D", id: "httpswwwfacebookcomsergionepposts10212151071148751commentid10212155057488407commentt2tn223a22r227d" },
        { title: "P A R A D O S S O", id: "p-a-r-a-d-o-s-s-o" },
        { title: "Su cubingitaly.org arriva la modalità Battle Royale", id: "su-cubingitalyorg-arriva-la-modalita-battle-royale" },
        { title: " tutorial ", id: "tutorial6" },
        { title: "L'orso Bubu", id: "lorso-bubu" },
        { title: "L'admin", id: "ladmin" }
    ];

    for (let title of titles) {
        it('Test the method to create a tutorial', async () => {
            let tutorial: TutorialEntity = await repo.createTutorial(title.title, user);
            assert(tutorial.id, title.id);
            assert(tutorial.title, title.title);
        });
    }


    it('Test the method to update date and editor', async () => {
        let tutorial: TutorialEntity = await repo.adminGetTutorial("ladmin");
        let updatedTutorial: TutorialEntity= await repo.updateTutorialDateAndEditor("ladmin",user2);
        assert.notEqual(tutorial.updateDate, updatedTutorial.updateDate);
        assert.equal(tutorial.lastEditor.id,397);
        assert.equal(updatedTutorial.lastEditor.id,0);
    });

    after(async () => {
        await database.closeConnection();
    });
});


