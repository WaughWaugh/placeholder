
console.log("My Placeholder");

var Placeholder = require('./Placeholder'),
    ph = new Placeholder();

// init placeholder
ph.load();

function getParentIds(doc) {
   const parentIds = {};

   doc.lineage.forEach( function ( lineage ) {
     for ( var attr in lineage ) {
       parentIds[ lineage[attr] ] = true;
     }
   });

   return Object.keys( parentIds );
}

function search(input, placetype, callback) {
  console.log("Placeholder input: " + input);

  ph.query(input, (err, res) => {
    try { 
      ph.store.get( res.getIdsAsArray()[0], (err, doc) => {

       try {

        if (doc == null || ( placetype != null && doc.placetype != placetype ) ) { callback([]); }

        console.log("===PH search===");
        console.log(JSON.stringify(doc, null, 2));

        var output = [];
       
        output.push({
       	  id: doc.id,
       	  name: doc.name,
       	  abbr: doc.abbr,
       	  placetype: doc.placetype
        });

        if( doc.lineage ) {
           const parentIds = getParentIds(doc); 

           console.log("Fetching parents");

       	 ph.store.getMany( parentIds, ( err, parentResults ) => {
       	   
       	   if( err ) { console.error( "Error fetching parentIds" ); }

             try {
       	      parentResults = parentResults || [];

       	      parentResults.forEach( function( parentResult ) {
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

       	   callback(output);
       	 });

        } else {

          callback(output);
        }
      } catch (err) {
        console.error("ph.store.getMany " + err);
        callback([]);
      }
    });
   } catch (err) {
     console.error("plceholder query " + err);
     callbck([]);
   }
  });
}

module.exports.search = search;
