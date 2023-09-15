const DatabaseService = require("./DatabaseService.js");

function cleanNotification(){
    DatabaseService.executeQuery("DELETE FROM notification WHERE pSeen=1");
}


module.exports = {cleanNotification}