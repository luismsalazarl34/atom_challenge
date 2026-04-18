import { v4 as uuidv4 } from 'uuid';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { getFirestore } from '../services/FirebaseService';

const COLLECTION = 'users';

export class FirestoreUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const db = getFirestore();
    const snapshot = await db
      .collection(COLLECTION)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return this.toEntity(snapshot.docs[0]);
  }

  async findById(id: string): Promise<User | null> {
    const db = getFirestore();
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return this.toEntity(doc);
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const db = getFirestore();
    const id = uuidv4();
    await db.collection(COLLECTION).doc(id).set({ email: data.email });
    return { id, email: data.email };
  }

  private toEntity(doc: FirebaseFirestore.DocumentSnapshot): User {
    const data = doc.data();
    if (!data) throw new Error(`User document ${doc.id} has no data`);
    return { id: doc.id, email: data['email'] as string };
  }
}
