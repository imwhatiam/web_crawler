define([
    'jquery',
    'backbone',
    'underscore',
    'zufang_app/view/item-view',
    'zufang_app/collection/collection'
], function($, Backbone, _, Item, Collection) {
    'use strict';

    var AppView = Backbone.View.extend({

        el: $('#zufang'),

        accessCountTemplate: _.template($('#access-count-tmpl').html()),

        initialize: function() {
            console.log('zufang_app/view/app-view.js: app-view init');
            this.$tableBody = this.$('tbody');
            this.$searchTitle= this.$('#search-submit');
            this.$searchContent= this.$('#content-search-submit');

            this.collection = new Collection();
            this.listenTo(this.collection, 'reset', this.reset);
            this.collection.fetch({reset: true});
            this.getAccessCount();
        },

        events: {
            'click #search-submit': 'inputSearch',
            'click #show-all': 'reset',
            'click #create-time-down': 'createTimeDown',
            'click #reply-count-down': 'replyCountDown',
            'click #reply-time-down': 'replyTimeDown',
            'click .direct-search': 'directSearch'
        },

        resortCollection: function() {
            this.collection.sort();
            this.$tableBody.empty();
            this.collection.each(this.addOne, this);
        },

        createTimeDown: function() {
            this.collection.comparator = function(model) {
              return -model.get("timestamp");
            };
            this.resortCollection();
            return false;
        },

        replyCountDown: function() {
            this.collection.comparator = function(model) {
              return -model.get("reply_count");
            };
            this.resortCollection();
            return false;
        },

        replyTimeDown: function() {
            this.collection.comparator = function(model) {
              return -model.get("reply_timestamp");
            };
            this.resortCollection();
            return false;
        },

        getAccessCount: function() {
            var _this = this;
            $.ajax({
                url: '/api/zufang-access-count/',
                success: function(data) {
                    _this.$('#access-count').html(_this.accessCountTemplate(data));
                }
            });
        },

        directSearch: function(e) {
            var value = $(e.currentTarget).text();
            this.search(value);
            return false
        },

        inputSearch: function() {
            var value = $('#search-input').val();

            if (value !== '') {
                this.search(value);
            }
            return false
        },

        search: function(value) {
            var _this = this,
                result = [];

            this.collection.each(function (model) {
                var title = model.get('title');
                if (title.indexOf(value) > -1) {
                    result.push(model);
                }
            });

            this.$tableBody.empty();

            _.each(result, function (item, index) {
                _this.addOne(item, index, value);
            });

            return false;
        },

        addOne: function(model, index, key_word_or_collection) {
            if (typeof key_word_or_collection == 'string') {
                // is search key word
                var view = new Item({
                        model: model,
                        key_word: key_word_or_collection
                    });
            } else {
                var view = new Item({model: model});
            }

            this.$tableBody.append(view.render().el);
        },

        reset: function() {
            console.log('zufang_app/view/app-view.js: collection reset');
            this.$tableBody.empty();
            this.collection.each(this.addOne, this);
            return false;
        }

    });

    return AppView;
});
