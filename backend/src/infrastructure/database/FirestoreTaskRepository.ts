import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from '@google-cloud/firestore';
import { Task } from '../../domain/entities/Task';
import { ITaskRepository } from '../../domain/repositories/ITaskRepository';
import { getFirestore } from '../services/FirebaseService';

const COLLECTION = 'tasks';

export class FirestoreTaskRepository implements ITaskRepository {
  async findByUserId(userId: string): Promise<Task[]> {
    const db = getFirestore();
    const snapshot = await db
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .get();

    return snapshot.docs
      .map((doc) => this.toEntity(doc))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(id: string): Promise<Task | null> {
    const db = getFirestore();
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return this.toEntity(doc);
  }

  async create(data: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const db = getFirestore();
    const id = uuidv4();
    const createdAt = Timestamp.now();
    await db.collection(COLLECTION).doc(id).set({ ...data, createdAt });
    return { id, ...data, createdAt: createdAt.toDate() };
  }

  async update(
    id: string,
    data: Partial<Pick<Task, 'title' | 'description' | 'completed'>>,
  ): Promise<Task> {
    const db = getFirestore();
    await db.collection(COLLECTION).doc(id).update(data);
    const updated = await db.collection(COLLECTION).doc(id).get();
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    const db = getFirestore();
    await db.collection(COLLECTION).doc(id).delete();
  }

  private toEntity(doc: FirebaseFirestore.DocumentSnapshot): Task {
    const data = doc.data();
    if (!data) throw new Error(`Task document ${doc.id} has no data`);
    const createdAt =
      data['createdAt'] instanceof Timestamp
        ? data['createdAt'].toDate()
        : new Date(data['createdAt']);

    return {
      id: doc.id,
      title: data['title'] as string,
      description: data['description'] as string,
      completed: data['completed'] as boolean,
      userId: data['userId'] as string,
      createdAt,
    };
  }
}
