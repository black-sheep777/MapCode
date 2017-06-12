/**
 * Created by blackSheep on 08-Jun-17.
 */
function groupService ($http){
    var group = {
         groupsList :{},
        deletionResult:{},
        updateResult:{},
        gpInfoResult:{},
        gpCreationResult:{},
        editInfo:{},
        getGroupsList : function(){
             var getGroups = window.apiHref+'groups/';
             return $http({url:getGroups,method:'GET'})
                 .success(function(data){
                     group.groupsList = data;
                 }).success(
                     function(data){
                         group.groupsList = data;
                     });
        },
        groupDeletion:function(name){
            var deletion = window.apiHref+'groups/'+name;
            return $http({url:deletion,method:"DELETE"})
                .success(function(data){
                    group.deletionResult = data;
                });
        },
        updateGroup : function(name,newGp){
            var gpUpdate = window.apiHref+'groups/'+name;
            return $http({url:gpUpdate,method:"PUT",data:newGp})
                .success(
                    function(data){
                        group.updateResult = data;
                    });
        },
        getGroupInfo: function(name){
            var gpInfo =  window.apiHref+'groups/'+name;
            return $http({url:gpInfo,method:"GET"})
                .success(
                    function(data){
                        group.gpInfoResult = data;
                    });
        },
        createGroup : function(GP){
            var creation =  window.apiHref+'groups';
            return $http({url:gpInfo,method:"POST",data:GP})
                .success(
                    function(data){
                        group.gpCreationResult = data;
                    });
        },
        setSharedInfo : function(availableFriends,gpName){
              group.editInfo ={
                  name:gpName,
                  friends:availableFriends
              };
        },
        getSharedInfo : function(){
            return  group.editInfo;
        }

    };
    return group;
};//end of groupeService
