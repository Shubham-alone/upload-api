import { MongoClient, GridFSBucket } from 'mongodb';

const uri = process.env.MONGO_URI!;

let client: MongoClient;
let bucket: GridFSBucket;

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(); // you can pass db name if needed like client.db('next-auth')
    bucket = new GridFSBucket(db, { bucketName: 'pdfs' });
  }

  return { db: client.db(), bucket };
}


