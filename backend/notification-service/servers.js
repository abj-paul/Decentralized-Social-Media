const USER_SERVICE_PORT = 3000;
const POST_SERVICE_PORT = 3001;
const NOTIFICATION_SERVICE_PORT = 3002;

const USER_SERVICE_SERVER = "user-service";
const POST_SERVICE_SERVER = "post-service";
const NOTIFICATION_SERVICE_SERVER = "notification_service";

const USER_SERVICE_MYSQL_SERVER = "mysql_user_server";
const POST_SERVICE_MYSQL_SERVER = "mysql_post_server";
const NOTIFICATION_SERVICE_MYSQL_SERVER = "mysql_notification_server";

const MYSQL_SERVER_USER = "abhidb";
const MYSQL_SERVER_PASSWORD = "admin";
const DATABASE_NAME = "DeSo";

const MINIO_SERVER = "minio";
const MINIO_PORT = 9000;
const MINIO_accessKey = 'YX5NGYgypBTlyrbEblEP';
const MINIO_secretKey = '1vgq3N5OvK5pMHUiMUfWAbB491u80DEMKabYxrbP';


module.exports = {USER_SERVICE_PORT, POST_SERVICE_PORT, NOTIFICATION_SERVICE_PORT, USER_SERVICE_MYSQL_SERVER, POST_SERVICE_MYSQL_SERVER, NOTIFICATION_SERVICE_MYSQL_SERVER, MYSQL_SERVER_USER, MYSQL_SERVER_PASSWORD, DATABASE_NAME, MINIO_SERVER, MINIO_PORT, MINIO_secretKey, MINIO_accessKey, USER_SERVICE_SERVER, POST_SERVICE_SERVER, NOTIFICATION_SERVICE_SERVER};
