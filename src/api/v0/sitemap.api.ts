import { getCustomRepository } from "typeorm";
import { Router } from "express";

import { ArticleEntity } from "../../db/entity/article.entity";
import { ArticleRepository } from "../../db/repository/article.repository";
import { TutorialRepository } from "../../db/repository/tutorial.repository";
import { TutorialEntity } from "../../db/entity/tutorial.entity";
import { FAQRepository } from "../../db/repository/faq.repository";
import { FAQEntity } from "../../db/entity/faq.entity";
//# we need this because otherwise passport doesn't work
const router: Router = Router();

const header: String = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">";
const websiteBase: string = "https://www.cubingitaly.org/";
class urlClass {
    loc: string;
    lastmod?: string;

    public import(source: Object, base: string) {
        this.loc = websiteBase + typeBase[base] + source['id'];
        let temp: Date = source['updateDate'];
        this.lastmod = temp.toISOString();
    }
}

let typeBase = {
    homepage: "",
    article: "articoli/",
    tutorial: "tutorial/",
    competitions: "competizioni/"
}

function getArticlesRepo(): ArticleRepository {
    return getCustomRepository(ArticleRepository);
}

function getTutorialRepo(): TutorialRepository {
    return getCustomRepository(TutorialRepository);
}

function getStaticPages(): urlClass[] {
    let pages: urlClass[] = [];
    pages.push(createStaticPage("https://www.cubingitaly.org"));
    pages.push(createStaticPage("https://www.cubingitaly.org/chi-siamo"));
    pages.push(createStaticPage("https://www.cubingitaly.org/articoli"));
    pages.push(createStaticPage("https://www.cubingitaly.org/tutorial"));
    pages.push(createStaticPage("https://www.cubingitaly.org/competizioni/proposte"));
    pages.push(createStaticPage("https://www.cubingitaly.org/contatti"));
    return pages;
}

async function getFAQPage(): Promise<urlClass> {
    let url: urlClass = new urlClass();
    url.loc = "https://www.cubingitaly.org/faq";
    let tempFAQ: FAQEntity = await getCustomRepository(FAQRepository).getLastMod();
    url.lastmod = tempFAQ.updateDate.toISOString();
    return url;
}

function createStaticPage(url: string): urlClass {
    let temp: urlClass = new urlClass();
    temp.loc = url;
    return temp;
}

router.get("/", async (req, res) => {
    let pages: urlClass[] = getStaticPages();

    let faq: urlClass = await getFAQPage();
    pages.push(faq);

    let articles: ArticleEntity[] = await (getArticlesRepo()).getPublicArticles(0, 99999);

    let temp: urlClass = new urlClass();

    for (let a of articles) {
        temp = new urlClass();
        temp.import(a, "article");
        pages.push(temp);
    }

    let tutorials: TutorialEntity[] = await (getTutorialRepo()).getTutorials();

    for (let t of tutorials) {
        temp = new urlClass();
        temp.import(t, "tutorial");
        pages.push(temp);
    }

    res.set("Content-Type", "text/xml");
    let urlencode = {
        urlencode: pages
    }

    let xml = header;
    for (let p of pages) {
        xml += "<url>";
        xml += "<loc>" + p.loc + "</loc>";
        if (p.lastmod) {
            xml += "<lastmod>" + p.lastmod + "</lastmod>";
        }
        xml += "</url>";
    }
    xml += "</urlset>";

    res.send(xml);
});

export { router }