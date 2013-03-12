define([
  'app',
  'backbone',
  'underscore',
  'core/directus',

  '../../extensions/cashregister/accounting.min',

  // modules
  '../../extensions/cashregister/product',
  '../../extensions/cashregister/user'

],

function(app, Backbone, _, Directus, Accounting, Product, User) {

 var Extension = {
    id: 'cash_register'
  };

  Handlebars.registerHelper('moneyFormat', function(number) {
    return Accounting.formatMoney(number);
  });;
  
Extension.Router = Directus.SubRoute.extend({
    routes: {
      "":         "index"
    },

    index: function() {
      this.v.main.render();
    },

    initialize: function() {

      var routerProxy = this;

      var collections = {
          quickPicksCollection: new Product.QuickPicksCollection(),
          customerCollection: new User.Collection(),
          activeProductsCollection: new Product.ActiveProductsCollection()
        };

      _.extend(this, collections);

      this.v = {};

      this.v.subMain = new Backbone.Layout({
          prefix: 'extensions/cashregister/templates/',

          template: 'register-main',

          events: {
            'keyup #customer-filter': 'update_users_table',
            'keyup #quickpicks-filter': 'update_products_table'
          },

          views: {
              '.quick_picks_table': new Product.QuickPicksListView({collection: this.quickPicksCollection, activeProductsCollection: this.activeProductsCollection}),
              '.active_products_table': new Product.ActiveProductsListView({collection: this.activeProductsCollection}),
              '.customers_table': new User.ListView({collection: this.customerCollection })
          },

          update_users_table: _.debounce(function(e) {

            var searchVal = e.currentTarget.value;

            if (searchVal.length > 0) {
              routerProxy.customerCollection.url = '/directus/api/1/extensions/cashregister/customers/' + searchVal;
            } else {
              routerProxy.customerCollection.url = '/directus/api/1/extensions/cashregister/customers';
            }

            routerProxy.customerCollection.fetch();
          }, 800),

          update_products_table: _.debounce(function(e) {

            console.log('this doesnt work yet');

          }, 800)
      });


      this.v.main = new Backbone.Layout({
          template: 'page',
          el: '#content',
          views: {
              '#page-content': this.v.subMain
          },
          serialize: function() {
            return {title: 'Cash Register'};
          }
      });

      this.quickPicksCollection.fetch();
      this.customerCollection.fetch();

    }

  });

  return Extension;
});