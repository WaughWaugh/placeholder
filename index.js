
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
  console.error("Placeholder input: " + input);

  ph.query(input, (err, res) => {

    ph.store.get( res.getIdsAsArray()[0], (err, doc) => {

      if (doc == null || ( placetype != null && doc.placetype != placetype ) ) { callback([]); }

      console.error("===PH search===");
      console.error(JSON.stringify(doc, null, 2));

      const parentIds = getParentIds(doc); 

      var output = [];
     
      output.push({
     	  id: doc.id,
     	  name: doc.name,
     	  abbr: doc.abbr,
     	  placetype: doc.placetype
      });

      if( doc.lineage ) {

     	 ph.store.getMany( parentIds, ( err, parentResults ) => {
     	   
     	   if( err ) { console.error( "Error fetching parentIds" ); }

     	   parentResults = parentResults || [];

     	   parentResults.forEach( function( parentResult ) {
     	      output.push({
     	   	id: parentResult.id,
     	   	name: parentResult.name,
     	   	abbr: parentResult.abbr,
     	   	placetype: parentResult.placetype
     	      });
     	   });

     	   callback(output);
     	 });

      } else {

 	callback(output);
      }
    });
  });
}

module.exports.search = search;