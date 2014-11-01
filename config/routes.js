// Draw routes.  Locomotive's router provides expressive syntax for drawing
// routes, including support for resourceful routes, namespaces, and nesting.
// MVC routes can be mapped to controllers using convenient
// `controller#action` shorthand.  Standard middleware in the form of
// `function(req, res, next)` is also fully supported.  Consult the Locomotive
// Guide on [routing](http://locomotivejs.org/guide/routing.html) for additional
// information.
module.exports = function routes() {

  //page controller

  this.root('pages#index');
  this.get("/dev",'pages#main');
  
  this.get("/details/:id", "pages#showDetail");

  //map controller

  this.get("/findrecords/:range/:lat/:lng", "map#findRecords");
  this.post("/searchOnMap", 'map#searchOnMap');
  this.get("/search", "map#search");
  this.get("/getnearestresult/:noofresult/:lat/:lng/:type", "map#getNearestResult");

  //inspections controller
  this.get("/getlatestcomment/:id", "inspections#getLatestComment");
  this.post("/addcomment", "inspections#addComment");

  //list controller

  this.get("/search/list", "list#search");
  //setting controller
  this.get("/settings", "pages#settings");

  //help controller
  this.get("/help", "pages#help");

  //complaint controller
  this.get("/complaint", "pages#complaint");
}
