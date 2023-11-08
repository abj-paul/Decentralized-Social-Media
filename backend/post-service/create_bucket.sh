#!/bin/sh

AWS_ENDPOINT = "http://minio:9000"
AWS_ACCESS_KEY_ID = "YX5NGYgypBTlyrbEblEP"
AWS_SECRET_ACCESS_KEY = "1vgq3N5OvK5pMHUiMUfWAbB491u80DEMKabYxrbP"

/usr/bin/mc config host add local ${AWS_ENDPOINT} ${AWS_ACCESS_KEY_ID} ${AWS_SECRET_ACCESS_KEY};
/usr/bin/mc rm -r --force local/${AWS_BUCKET};
/usr/bin/mc mb -p local/${AWS_BUCKET};
/usr/bin/mc policy set download local/${AWS_BUCKET};
/usr/bin/mc policy set public local/${AWS_BUCKET};
/usr/bin/mc anonymous set upload local/${AWS_BUCKET};
/usr/bin/mc anonymous set download local/${AWS_BUCKET};
/usr/bin/mc anonymous set public local/${AWS_BUCKET};

exit 0;

