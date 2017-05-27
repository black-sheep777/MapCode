var lodashIncludes = require('lodash/includes');
var asyncForEach = require('async/each');
var moment = require('moment');

var db = require('../db');


module.exports.publicFields = ['name', 'members'];


// Verification schema
module.exports.schema = {
    'name': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isLength: {
            options: {min: 1, max: 25},
            errorMessage: 'length_not_1_to_25'
        }
    },
    'members': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isArray: {
            errorMessage: 'not_array'
        }
    }
};


// Update verification schema
module.exports.updateSchema = {
    'new_name': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isLength: {
            options: {min: 1, max: 25},
            errorMessage: 'length_not_1_to_25'
        }
    },
    'new_members': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isArray: {
            errorMessage: 'not_array'
        }
    }
};


/*
    Errors:
        - less_than_two_members
        - group_already_exists
        - username_%s_not_friend
            (%s will replace with the username)
            (If username is the owner's username)
            (If username does not exists)
            (If username is not owner's friend)

        - serverError
 */
module.exports.add = function (userId, gpName, gpMembers, callback) {
    // Call addGroup DB procedure
    db.conn.query(
        "CALL `addGroup` (?, ?, ?)",
        [userId, gpName, gpMembers],
        function (err) {
            // DB error has happened
            if (err) {
                // Procedure error has happened
                if (err.sqlState === '45000') {
                    if (lodashIncludes(err.message, 'LESS_THAN_TWO_MEMBERS'))
                        return callback('less_than_two_members');

                    if (lodashIncludes(err.message, 'GROUP_ALREADY_EXISTS'))
                        return callback('group_already_exists');

                    var notFriendUsernameError = /USERNAME_(.*)_NOT_FRIEND/.exec(err.message);
                    if (notFriendUsernameError)
                        return callback(notFriendUsernameError[0].toLowerCase());
                }

                console.error("add@models/groups: Error in calling addGroup DB procedure:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // Group successfully added!
            callback();
        }
    );
};


/*
    Errors:
        - serverError
 */
module.exports.delete = function (userId, gpName, callback) {
    db.conn.query(
        "DELETE FROM `groups` WHERE `owner` = ? AND `name` = ?",
        [userId, gpName],
        function (err) {
            // MySQL error happened
            if (err) {
                console.log("MySQL: Error in deleting user's group:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }


            // Group has deleted
            callback();
        }
    );
};


/*
 Errors:
    - group_not_exists
    - less_than_two_members
    - group_already_exists
    - username_%s_not_friend
        (%s will replace with the username)
        (If username is the owner's username)
        (If username does not exists)
        (If username is not owner's friend)

    - serverError
 */
module.exports.update = function (userId, gpName, newName, members, callback) {
    db.conn.query(
        "CALL `updateGroup` (?, ?, ?, ?)",
        [userId, gpName, newName, members],
        function (err) {
            // DB error has happened
            if (err) {
                // Procedure error has happened
                if (err.sqlState === '45000') {
                    if (lodashIncludes(err.message, 'LESS_THAN_TWO_MEMBERS'))
                        return callback('less_than_two_members');

                    if (lodashIncludes(err.message, 'GROUP_ALREADY_EXISTS'))
                        return callback('group_already_exists');

                    if (lodashIncludes(err.message, 'GROUP_NOT_EXISTS'))
                        return callback('group_not_exists');

                    var notFriendUsernameError = /USERNAME_(.*)_NOT_FRIEND/.exec(err.message);
                    if (notFriendUsernameError)
                        return callback(notFriendUsernameError[0].toLowerCase());
                }

                console.error("add@models/groups: Error in calling addGroup DB procedure:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // Group successfully added!
            callback();
        }
    );
};


/*
    Errors:
        - serverError
 */
module.exports.getGroup = function (userId, groupName, fields, callback) {
    db.conn.query(
        "SELECT " + (fields === '*' ? '*' : fields.map(db.conn.escapeId)) +
        " FROM `groups_detailed`" +
        " WHERE `owner` = ? AND `name` = ?",
        [userId, groupName],
        function (err, results) {
            if (err) {
                console.log("getGroup@models/groups.js: MySQL: Error in getting group's info:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            if (results[0] && results[0].members)
                    results[0].members = results[0].members.split(' ');

            callback(null, results[0]);
        }
    );
};


/*
    Get list of user's groups

    Errors:
        - serverError
 */
module.exports.getUserGroups = function (userId, fields, start, limit, callback) {
    db.conn.query(
        " SELECT " + (fields === '*' ? '*' : fields.map(db.conn.escapeId)) +
        " FROM `groups_detailed`" +
        " WHERE `owner` = ?" +
        " LIMIT ?, ?",
        [userId, start, limit],
        function (err, results) {
            if (err) {
                console.log("getUserGroups@models/groups.js: Error in getting user's groups:\n\n\t%s" +
                    "\n\tQuery:\n\n\t%s", err, err.sql);
                return callback('serverError');
            }

            // If `members` field is requested, split the field by ' ' and make it a array
            if (fields.includes('members')) {
                asyncForEach(
                    results,
                    function (result, done) {
                        result.members = result.members.split(' ');
                        done();
                    },
                    function (err) {
                        if (err) {
                            console.log("getUserGroups@models/groups.js: Error in splitting results members field:\n\n\t%s" + err);
                            return callback('serverError');
                        }

                        callback(null, results);
                    }
                );
            }
            else
                callback(null, results);
        }
    );
};


/*
    Sends a message to group members

     Errors:
         - sender_not_found
         - receiver_not_found
         - point_not_found
         - personal_point_not_found
         - no_point
         - both_points
         - self_message

         - serverError
 */
module.exports.sendMessage = function (sender, gpName, point, personal_point, message, callback) {
    var sent_time = moment().format('YYYY-MM-DD HH:mm:ss');
    db.conn.query(
        "CALL `sendGroupMessage` (?, ?, ?, ?, ?, ?)",
        [sender, gpName, point, personal_point, sent_time, message],
        // MySQL error has happened
        function (err) {
            if (err) {
                if (err.sqlState === '45000') {
                    if (lodashIncludes(err.message, "PERSONAL_POINT_NOT_FOUND"))
                        return callback('personal_point_not_found');

                    if (lodashIncludes(err.message, "SENDER_NOT_FOUND"))
                        return callback('sender_not_found');

                    if (lodashIncludes(err.message, "GROUP_NOT_FOUND"))
                        return callback('group_not_found');

                    if (lodashIncludes(err.message, "POINT_NOT_FOUND"))
                        return callback('point_not_found');

                    if (lodashIncludes(err.message, "NO_POINT"))
                        return callback('no_point');

                    if (lodashIncludes(err.message, "BOTH_POINTS"))
                        return callback('both_points');
                }

                // Unexpected MySQL error has happened
                console.error("sendMessage@models/groups: Error in calling sendGroupMessage DB procedure:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // Message successfully sent to all group members
            callback();
        }
    );
};