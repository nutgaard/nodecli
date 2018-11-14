const fetch = require('./fetch').fetch;

function wiki(value) {
    return {
        "representation": "wiki",
        value
    };
}

function storage(value) {
    return {
        "representation": "storage",
        value
    };
}

const content = {
    wiki,
    storage
};

function getPage(pageId) {
    return fetch(`https://confluence.intra.eika.no/rest/api/content/${pageId}?expand=body.storage,version`)
        .then((resp) => resp.json());
}

function findPage(space, title) {
    return fetch(`https://confluence.intra.eika.no/rest/api/content?spaceKey=${space}&title=${encodeURIComponent(title)}`)
        .then((resp) => resp.json());
}

function getPageIdIfExists(space, title) {
    return findPage(space, title)
        .then((json) => {
            if (json.results.length === 1) {
                return json.results[0].id
            }
            return -1;
        });
}

function createPage(parent, space, title, content) {
    return fetch('https://confluence.intra.eika.no/rest/api/content/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'page',
            title: title,
            ancestors: [{id: parent}],
            space: {key: space},
            body: {
                storage: content
            }
        })
    })
        .then((resp) => resp.json());
}

function upatePage(pageId, space, title, content) {
    return getPage(pageId)
        .then((page) => {
            return fetch(`https://confluence.intra.eika.no/rest/api/content/${pageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'page',
                    title: title,
                    space: {key: space},
                    body: {
                        storage: content
                    },
                    version: {
                        number: page.version.number + 1
                    }
                })
            })
        })
        .then((resp) => resp.json());
}

function findChildPages(parentId) {
    return fetch(`https://confluence.intra.eika.no/rest/api/content/search?cql=parent=${parentId}`)
        .then((resp) => resp.json())
        .then((json) => json.results.map((page) => ({id: page.id, title: page.title})))
}

function deletePage(pageId) {
    return fetch(`https://confluence.intra.eika.norest/api/content/${pageId}`, {
        method: 'DELETE'
    });
}

module.exports = {
    getPage,
    findPage,
    createPage,
    getPageIdIfExists,
    upatePage,
    findChildPages,
    deletePage,
    content
};