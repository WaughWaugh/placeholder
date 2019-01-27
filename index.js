
console.log("My Placeholder");

var Placeholder = require('./Placeholder'),
    ph = new Placeholder();

// init placeholder
ph.load();

var cache = {};

function getParentIds(doc) {
    const parentIds = {};

    doc.lineage.forEach(function (lineage) {
        for (var attr in lineage) {
            parentIds[lineage[attr]] = true;
        }
    });

    return Object.keys(parentIds);
}

function search(input, placetype, callback) {
    console.log("Placeholder input: " + input);

    if (cache.input == input) {
        console.log("Served from cache: input= " + input);

        callback(cache.output);
    } else {

        ph.query(input, (err, res) => {
            try {
                ph.store.get(res.getIdsAsArray(), (err, documents) => {

                    documents.sort(sortingAlgorithm);

                    documents.forEach(function (doc) {
                        try {

                            if (doc == null || (placetype != null && doc.placetype != placetype)) { callback([]); }

                            console.log("===PH search===");
                            console.log(JSON.stringify(doc, null, 2));

                            var output = [];

                            output.push({
                                id: doc.id,
                                name: doc.name,
                                abbr: doc.abbr,
                                placetype: doc.placetype
                            });

                            if (doc.lineage) {
                                const parentIds = getParentIds(doc);

                                console.log("Fetching parents");

                                ph.store.getMany(parentIds, (err, parentResults) => {

                                    if (err) { console.error("Error fetching parentIds"); }

                                    try {
                                        parentResults = parentResults || [];

                                        parentResults.forEach(function (parentResult) {
                                            output.push({
                                                id: parentResult.id,
                                                name: parentResult.name,
                                                abbr: parentResult.abbr,
                                                placetype: parentResult.placetype
                                            });
                                        });
                                    } catch (err) {
                                        console.error("ph.store.getMany: " + err);
                                    }

                                    cache.input = input;
                                    cache.output = output;

                                    callback(output);
                                });

                            } else {

                                callback(output);
                            }
                        } catch (err) {
                            console.error("ph.store.getMany " + err);
                            callback([]);
                        }

                    }); //SB -End
                });
            } catch (err) {
                console.error("plceholder query " + err);
                callbck([]);
            }
        });
    }
}

function sortingAlgorithm(a, b) {

    // condition 1 - population
    const a1 = a.population || 0;
    const b1 = b.population || 0;

    // condition 2 - geom.area
    const a2 = a.geom && a.geom.area || 0;
    const b2 = b.geom && b.geom.area || 0;

    if (a1 < b1) { return +1; }
    if (a1 > b1) { return -1; }
    if (a2 < b2) { return +1; }
    if (a2 > b2) { return -1; }
    return 0;
}

module.exports.search = search;
