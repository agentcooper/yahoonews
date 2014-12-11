/*
 * Artem Tyurin (artem.tyurin@gmail.com)
 *
 * 11.12.2014
 */

(function() {

'use strict';

var newsApp = angular.module('newsApp', [
  'ngRoute'
]);

/**
 * @return {String} url
 */ 
function getPipeURL(id) {
  var base = 'http://pipes.yahoo.com/pipes/pipe.run';

  return base + '?_id=' + id + '&_render=json&_callback=JSON_CALLBACK';
}

newsApp.factory('News', ['$http', '$timeout', '$q',
                function( $http ,  $timeout ,  $q ) {

  var articles = [];

  var COUNT = 10;

  var PIPE_ID = 'DqsF_ZG72xGLbes9l7okhQ';

  return {

    /**
     * @param  {Number|String} id Article id
     * @return {Promise}
     */
    getArticleById: function(id) {
      var deferred = $q.defer();

      this.getArticles().then(function(articles) {

        var article = articles.filter(function(article) {
          return article.id === Number(id);
        })[0];

        deferred.resolve(article);

      });

      return deferred.promise;
    },

    /**
     * @return {Promise}
     */
    getArticles: function() {
      var deferred = $q.defer();

      if (articles.length > 0) {
        deferred.resolve(articles);
      } else {

        $http.jsonp(
          getPipeURL(PIPE_ID)
        ).success(function(data) {

          Array.prototype.push.apply(
            articles,
            data.value.items.slice(0, COUNT).map(function(item, index) {
              item.id = index;

              return item;
            })
          );

          deferred.resolve(articles);
        });

      }

      return deferred.promise;
    }
  }
}]);

newsApp.controller('MainCtrl', ['$scope', 'News',
                       function( $scope ,  News ) {

  News.getArticles().then(function(articles) {
    $scope.articles = articles;
  });

}]);

newsApp.controller('ArticleCtrl', ['$scope', 'News', '$routeParams', '$sce',
                          function( $scope ,  News ,  $routeParams ,  $sce ) {
  
  var id = $routeParams.articleId;

  News.getArticleById(id).then(function(article) {

    $scope.article = {

      title:    article.title,
      origLink: article['feedburner:origLink'],
      author:   article.author,
      pubDate:  article.pubDate,

      description: $sce.trustAsHtml(article.description)
    };

  });

}]);

newsApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'main.html',
      controller: 'MainCtrl'
    }).
    when('/article/:articleId', {
      templateUrl: 'article.html',
      controller: 'ArticleCtrl'
    }).
    otherwise({
      redirectTo: '/'
    });
}]);

})();
