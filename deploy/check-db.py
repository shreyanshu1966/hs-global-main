import paramiko
import sys
import os

host = "129.121.78.185"
user = "root"
password = "Hsglobalexport@8875"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(host, username=user, password=password, timeout=10)
    
    script = """
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    cd /var/www/hs-global-main/backend
    node -e "
      const { MongoClient } = require('mongodb');
      require('dotenv').config();
      (async () => {
        const client = new MongoClient(process.env.MONGO_URI || process.env.MONGODB_URI);
        await client.connect();
        const doc = await client.db().collection('products').findOne({ productCode: 'HSMCETWH37' });
        const docs = await client.db().collection('products').find({ productCode: 'HSMCETWH37' }).toArray();
        console.log('Docs found:', docs.length);
        for (const doc of docs) {
            console.log({ _id: doc._id, title: doc.title, seoTitle: doc.seoTitle });
        }
        await client.close();
      })();
    "
    """
    stdin, stdout, stderr = ssh.exec_command(script)
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())
finally:
    ssh.close()
