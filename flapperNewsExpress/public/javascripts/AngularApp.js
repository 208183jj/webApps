var app = angular.module('flapperNews',['ui.router']);
app.config([
  '$stateProvider','$urlRouterProvider',
  function($stateProvider,$urlRouterProvider){
    $stateProvider.state('home', 
      {
        url:'/home',
        templateUrl:'/home.html', 
        controller:'MainCtrl',
        resolve: {
          PostPromise: ['posts',function(posts){
          return posts.getAll();
          }]
        }
      });
    $stateProvider.state('posts', {
  url: '/posts/{id}',
  templateUrl: '/posts.html',
  controller: 'PostsCtrl',
  resolve: {
    post: ['stateParams', 'posts', function($stateParams, posts){
      return posts.get($stateParams.id);
    }]
  }
});
    $urlRouterProvider.otherwise('home');
  }]);
app.factory('posts', ['$http', function($http) {
  var postFactory = {
    posts: []
  };

  postFactory.get = function(id)
  {
    return $http.get('/posts/' + id).then(function(res){
      return res.data;
    });
  };
  postFactory.getAll = function()
  {
    $http.get('/posts').success(function(data){
      angular.copy(data, postFactory.posts);
    });
  };

  postFactory.create = function(post){
    return $http.post('/posts', post).success(function(data){
      postFactory.posts.push(data);
    });
  };
  postFactory.upvote = function(post) {
    return $http.put('/posts/'+post._id + '/upvote').success(function(data){
      post.upvotes+=1;
    });
  };

  postFactory.addComment = function(id, comment){
    return $http.post('/posts/'+id+'/comments',comment);
  };
  postFactory.upvoteComment = function(post, comment){
    return $http.put('/posts/'+post._id+'/comments/'+comment._id+'/upvote')
    .success(function(data){
      comment.upvotes+=1;
    });
  };
  return postFactory;
}]);
app.controller('MainCtrl', [
  '$scope', 
  'posts', 
  function($scope, posts){
    $scope.posts = posts.posts;
    $scope.addPost = function () {

      if(!$scope.title|| $scope.title===''){return;}

      posts.create({
        title:$scope.title,
        link:$scope.link,
      });/*
      $scope.posts.push({
        title: $scope.title, 
        link: $scope.link,
        comments:[],
        upvotes: 0});*/
      $scope.title='';
      $scope.link='';
    };
    $scope.incrementUpvotes = function(post) {
      posts.upvote(post);
    };
  }]);
app.controller('PostsCtrl', [
'$scope',
'$posts',
'post',
function($scope,posts, post){
  $scope.post = post;

  $scope.addComment = function(){
    if($scope.body === '') { return; }
    posts.addComment(post._id, {
      body: $scope.body,
      author: 'user',
    }).success(function(comment){
      console.log(comment);
      $scope.post.comments.push(comment);
    });
    $scope.body = '';
  };
  $scope.incrementUpvotes = function(comment){
    posts.upvoteComment(post, comment);
  };
}]);
/*function($scope, $stateParams, posts){
  $scope.post = posts.posts[$stateParams.id];

  $scope.addComment = function(){
    if($scope.body === '') { return; }
    $scope.post.comments.push({
      body: $scope.body,
      author: 'user',
      upvotes: 0
    });
    $scope.body = '';
  };

  $scope.incrementUpvotes = function(comment){
    comment.upvotes += 1;
  };
}]);*/


