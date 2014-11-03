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

  this.get("/findrecordsformap/:range/:lat/:lng", "map#findRecords");
  this.post("/searchOnMap", 'map#searchOnMap');
  this.get("/search", "map#search");
  this.get("/getnearestresult/:noofresult/:lat/:lng/:type", "map#getNearestResult");
  this.get("/findbusinessformap/:business/:lat/:lng", "map#getNearestBusiness");

  //inspections controller
  this.get("/getlatestcomment/:id", "inspections#getLatestComment");
  this.post("/addcomment", "inspections#addComment");

  //list controller

  this.get("/search/list", "list#search");
  this.get("/findrecordsforlist/:range/:lat/:lng/:offset", "list#findRecords");
  this.get("/findbusinessforlist/:business/:lat/:lng/:offset", "list#getNearestBusiness");

  //setting controller
  this.get("/settings", "pages#settings");

  //help controller
  this.get("/help", "pages#help");

  //complaint controller
  this.get("/complaint/:id", "pages#complaint");
  this.post("/complaint/:id", "inspections#addComment");

  //profile page
  this.get("/profile", "pages#profile");
}
