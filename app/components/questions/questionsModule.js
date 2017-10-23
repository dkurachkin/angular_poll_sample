'use strict';

var questionsModule = angular.module('questionsModule', []);

questionsModule.controller('QuestionsCtrl',
    function ($scope, $http, $attrs) {
        var pollId = $attrs.pollId;
        $http({ method: 'GET', url: 'app/json/' + pollId + '.json' }).
            then(function success(response) {
                $scope.question = response.data;
            });

        $scope.sendVote = function () {
            $http.post("app/api/" + pollId, JSON.stringify({ data: $scope.selection }))
                .then(function (response) {
                    $scope.question = response.data;
                },
                function (response) {
                    $scope.updateQuestion();
                    throw (new Error(response.statusText));
                });
        };

        $scope.updateQuestion = function () {
            $scope.question.voted = true;
            $scope.question.total_votes += $scope.selection.length;
            if ($scope.question.voters) {
                $scope.question.voters += 1;
            }
            $scope.question.answers.forEach(function(answer) {
                var founded = $scope.selection.find(function(elem){return elem === answer.value;});
                if(founded) {
                    answer.voted = true;
                    answer.votes += 1;
                }    
            });
        };

        $scope.selection = [];
        $scope.toggleSelection = function toggleSelection(answer) {
            if ($scope.question.mulltiple) {
                var idx = $scope.selection.indexOf(answer);
                if (idx > -1) {
                    $scope.selection.splice(idx, 1);
                }
                else {
                    $scope.selection.push(answer);
                }
            }
            else {
                $scope.selection = [answer];
            }
        };
    }
);

questionsModule.directive("questionList", function () {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'app/components/questions/questionsTemplate.html',
        link: function ($scope, $element, $attrs) {
            $scope.calcAnswer = function calcAnswer(value) {
                var answer = $scope.question.answers.find(function (a) { return a.value === value });
                return Math.round((answer.votes / $scope.question.total_votes) * 100);
            };
        }
    };
});

